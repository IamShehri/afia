from fastapi import FastAPI, HTTPException
from fastapi import File, UploadFile
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import os
import uvicorn
import fitz  # PyMuPDF
import hashlib
import io
import re
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib import error as urlerror
from urllib import request as urlrequest

# DeBERTa-v2 NER models fail when transformers loads with SDPA
# (scaled_dot_product_attention). openmed 1.7.0 defaults to "auto", which picks
# sdpa whenever torch exposes it — including on Windows CPU. A bare terminal
# openmed.analyze_text() call uses the same API but often succeeds because torch
# builds differ; the bridge must force eager so loads match known-good behavior.
# OpenMedConfig also reads this env var for extract_pii and other pipelines.
os.environ.setdefault("OPENMED_TORCH_ATTENTION_BACKEND", "eager")

import openmed

# analyze_text(**pipeline_kwargs) forwards to ModelLoader.create_pipeline, which
# threads model_kwargs into from_pretrained(attn_implementation=...).
_OPENMED_PIPELINE_KWARGS = {"model_kwargs": {"attn_implementation": "eager"}}


def _analyze_text(text: str, model: Optional[str] = None):
    if model:
        return openmed.analyze_text(
            text,
            model_name=model,
            **_OPENMED_PIPELINE_KWARGS,
        )
    return openmed.analyze_text(text, **_OPENMED_PIPELINE_KWARGS)

app = FastAPI(title="AFIA OpenMed Bridge", version="1.0.0")

# --- HuggingFace model availability cache -----------------------------------

CACHE_DIR = Path.home() / ".cache" / "afia"
CACHE_FILE = CACHE_DIR / "model_availability.json"
CACHE_TTL = timedelta(days=7)
HF_HEAD_TIMEOUT = 3
_HF_CHECK_CONCURRENCY = 10

_availability_cache: dict[str, dict] = {}
_cache_loaded = False


def _ensure_cache_loaded() -> None:
    global _cache_loaded
    if _cache_loaded:
        return
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if CACHE_FILE.exists():
        try:
            raw = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                _availability_cache.update(raw)
        except (json.JSONDecodeError, OSError):
            pass
    _cache_loaded = True


def _save_cache_to_disk() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    try:
        CACHE_FILE.write_text(
            json.dumps(_availability_cache, indent=2),
            encoding="utf-8",
        )
    except OSError:
        pass


def _is_cache_fresh(entry: dict) -> bool:
    checked_at = entry.get("checked_at")
    if not checked_at:
        return False
    try:
        ts = datetime.fromisoformat(str(checked_at))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - ts < CACHE_TTL
    except ValueError:
        return False


def _head_hf_model_sync(model_id: str) -> Optional[bool]:
    """HEAD HuggingFace config.json. True/False if known, None on network error."""
    url = f"https://huggingface.co/{model_id}/resolve/main/config.json"
    req = urlrequest.Request(url, method="HEAD")
    try:
        with urlrequest.urlopen(req, timeout=HF_HEAD_TIMEOUT) as resp:
            return resp.status == 200
    except urlerror.HTTPError as exc:
        if exc.code in (401, 404):
            return False
        return None
    except (urlerror.URLError, TimeoutError, OSError):
        return None


async def model_exists_on_hf(model_id: str) -> Optional[bool]:
    """
    Verify model exists on HuggingFace.
    Returns True/False when determined; None if network failed and no cache.
    """
    _ensure_cache_loaded()
    entry = _availability_cache.get(model_id)
    if entry and _is_cache_fresh(entry):
        return bool(entry["exists"])

    result = await asyncio.to_thread(_head_hf_model_sync, model_id)

    if result is None:
        if entry:
            return bool(entry["exists"])
        return None

    _availability_cache[model_id] = {
        "exists": result,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    _save_cache_to_disk()
    return result


def mark_model_unavailable(model_id: str) -> None:
    _ensure_cache_loaded()
    _availability_cache[model_id] = {
        "exists": False,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    _save_cache_to_disk()


async def _should_include_model(model_id: str) -> bool:
    exists = await model_exists_on_hf(model_id)
    if exists is False:
        return False
    return True


async def filter_available_models(model_ids: list[str]) -> list[str]:
    sem = asyncio.Semaphore(_HF_CHECK_CONCURRENCY)

    async def check_one(model_id: str) -> tuple[str, bool]:
        async with sem:
            include = await _should_include_model(model_id)
            return model_id, include

    results = await asyncio.gather(*(check_one(m) for m in model_ids))
    return [model_id for model_id, include in results if include]


def _is_model_unavailable_error(exc: Exception) -> bool:
    name = type(exc).__name__
    if "RepositoryNotFound" in name or "EntryNotFound" in name:
        return True
    msg = str(exc).lower()
    return (
        "repositorynotfound" in msg
        or "repository not found" in msg
        or ("401" in msg and "huggingface" in msg)
    )


def _model_unavailable_response(model_id: str) -> JSONResponse:
    mark_model_unavailable(model_id)
    return JSONResponse(
        status_code=422,
        content={"error": "model_unavailable", "model": model_id},
    )


def _require_analysis_model_name(result, expected_model: Optional[str] = None) -> str:
    """Ensure inference ran under an identifiable model — never silent empty success."""
    if result is None:
        raise HTTPException(
            status_code=500,
            detail="Analysis returned no result (model may have failed to load)",
        )
    model_name = getattr(result, "model_name", None)
    if not model_name:
        raise HTTPException(
            status_code=500,
            detail="Analysis completed without a model identity (pipeline may have failed silently)",
        )
    if expected_model and model_name != expected_model:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Requested model {expected_model} but inference ran with {model_name}"
            ),
        )
    return model_name


def _group_openmed_models(model_ids: list[str]) -> dict:
    grouped = {
        "ner": [],
        "pii": [],
        "zeroshot": [],
        "other": [],
    }
    for m in model_ids:
        name = m.split("/")[-1]
        if "NER-" in m and "ZeroShot" not in m:
            grouped["ner"].append({"id": m, "name": name})
        elif "PII" in m:
            grouped["pii"].append({"id": m, "name": name})
        elif "ZeroShot" in m:
            grouped["zeroshot"].append({"id": m, "name": name})
        else:
            grouped["other"].append({"id": m, "name": name})
    return grouped

# --- App middleware ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str
    model: Optional[str] = None

class DeidentifyRequest(BaseModel):
    text: str
    language: Optional[str] = "en"

def split_sentences(text: str) -> list[str]:
    # Simple sentence splitter
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 10]

def score_sentence(sentence: str, question_words: set) -> float:
    sentence_words = set(re.findall(r'\b\w+\b', sentence.lower()))
    overlap = len(question_words & sentence_words)
    if overlap == 0:
        return 0.0
    return overlap / (len(question_words) + 0.001)

STOP_WORDS = {
    "what", "is", "are", "the", "a", "an", "of", "in", "on",
    "for", "to", "and", "or", "does", "do", "did", "was",
    "were", "how", "why", "who", "when", "where", "which",
    "this", "that", "with", "has", "have", "had"
}

@app.get("/health")
def health():
    return {"status": "ok", "version": openmed.__version__}

@app.get("/models")
async def list_models():
    all_models = openmed.list_models()
    available = await filter_available_models(all_models)
    return _group_openmed_models(available)

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        if req.model:
            result = _analyze_text(req.text, req.model)
        else:
            result = _analyze_text(req.text)
        return {
            "text": result.text,
            "model": result.model_name,
            "processing_time": result.processing_time,
            "timestamp": result.timestamp,
            "entities": [
                {
                    "text": e.text,
                    "label": e.label,
                    "confidence": e.confidence,
                    "start": e.start,
                    "end": e.end,
                }
                for e in result.entities
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/deidentify")
def deidentify(req: DeidentifyRequest):
    try:
        result = openmed.deidentify(req.text, lang=req.language)
        return {
            "original": req.text,
            "deidentified": result.deidentified_text,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pii")
def extract_pii(req: AnalyzeRequest):
    try:
        result = openmed.extract_pii(req.text)
        entities = []
        if hasattr(result, "entities"):
            for e in result.entities:
                entities.append({
                    "text": e.text,
                    "label": e.label,
                    "confidence": e.confidence,
                    "start": e.start,
                    "end": e.end,
                })
        return {"text": req.text, "entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        digest = hashlib.sha256(content).hexdigest()[:16]
        
        doc = fitz.open(stream=content, filetype="pdf")
        pages = []
        full_text = ""
        offset = 0
        
        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            page_start = offset
            page_end = offset + len(page_text)
            
            pages.append({
                "page_number": page_num + 1,
                "text": page_text,
                "char_start": page_start,
                "char_end": page_end,
                "width": page.rect.width,
                "height": page.rect.height,
            })
            
            full_text += page_text
            offset = page_end
        
        doc.close()
        
        return {
            "document_id": digest,
            "filename": file.filename,
            "page_count": len(pages),
            "full_text": full_text,
            "pages": pages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/render-page")
async def render_page(
    file: UploadFile = File(...),
    page_number: int = 1,
):
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        
        if page_number < 1 or page_number > len(doc):
            raise HTTPException(status_code=400, detail="Invalid page number")
        
        page = doc[page_number - 1]
        # Render at 2x zoom for crisp display
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("png")
        
        doc.close()
        
        return Response(content=img_bytes, media_type="image/png")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChunkAnalyzeRequest(BaseModel):
    text: str
    chunk_size: Optional[int] = 3000
    model: Optional[str] = None

@app.post("/analyze-document")
def analyze_document(req: ChunkAnalyzeRequest):
    try:
        text = req.text
        chunk_size = req.chunk_size or 3000
        all_entities = []
        model_used: Optional[str] = None
        chunks_analyzed = 0

        for i in range(0, len(text), chunk_size):
            chunk = text[i : i + chunk_size]
            if not chunk.strip():
                continue

            if req.model:
                result = _analyze_text(chunk, req.model)
            else:
                result = _analyze_text(chunk)

            chunk_model = _require_analysis_model_name(result, req.model)
            if model_used is None:
                model_used = chunk_model
            elif model_used != chunk_model:
                raise HTTPException(
                    status_code=500,
                    detail=f"Inconsistent model across chunks: {model_used} vs {chunk_model}",
                )

            chunks_analyzed += 1
            for e in result.entities:
                all_entities.append(
                    {
                        "text": e.text,
                        "label": e.label,
                        "confidence": e.confidence,
                        "start": e.start + i,
                        "end": e.end + i,
                    }
                )

        if text.strip() and chunks_analyzed == 0:
            raise HTTPException(
                status_code=500,
                detail="Document text could not be analyzed (no processable chunks)",
            )

        if text.strip() and not model_used:
            raise HTTPException(
                status_code=500,
                detail="Analysis completed without a model identity",
            )

        return {
            "text": text,
            "entities": all_entities,
            "chunk_count": max(1, (len(text) + chunk_size - 1) // chunk_size)
            if text
            else 0,
            "model_used": model_used,
        }
    except HTTPException:
        raise
    except Exception as e:
        if req.model and _is_model_unavailable_error(e):
            return _model_unavailable_response(req.model)
        raise HTTPException(status_code=500, detail=str(e))

class AskDocumentRequest(BaseModel):
    text: str
    question: str
    top_k: Optional[int] = 3

@app.post("/ask-document")
def ask_document(req: AskDocumentRequest):
    try:
        sentences = split_sentences(req.text)
        question_words = set(re.findall(r'\b\w+\b', req.question.lower()))
        question_words = question_words - STOP_WORDS
        
        if not question_words:
            return {
                "question": req.question,
                "answer": "Please ask a more specific question.",
                "sources": [],
            }
        
        scored = []
        offset = 0
        for sent in sentences:
            score = score_sentence(sent, question_words)
            idx = req.text.find(sent, offset)
            if idx == -1:
                idx = offset
            if score > 0:
                scored.append({
                    "text": sent,
                    "score": round(score, 3),
                    "start": idx,
                    "end": idx + len(sent),
                })
            offset = idx + len(sent)
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        top_results = scored[:req.top_k]
        
        if not top_results:
            return {
                "question": req.question,
                "answer": "I couldn't find relevant information in this document for that question.",
                "sources": [],
            }
        
        answer = " ".join([r["text"] for r in top_results[:2]])
        
        return {
            "question": req.question,
            "answer": answer,
            "sources": top_results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
