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
from markitdown import MarkItDown
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


def collect_sentence_spans(text: str) -> list[dict]:
    """Map split_sentences() back to document character offsets."""
    spans: list[dict] = []
    offset = 0
    for sent in split_sentences(text):
        idx = text.find(sent, offset)
        if idx == -1:
            idx = offset
        spans.append(
            {
                "text": sent,
                "char_start": idx,
                "char_end": idx + len(sent),
            }
        )
        offset = idx + len(sent)
    return spans


# --- Extractive retrieval (Talk to Document v1) ------------------------------

RETRIEVAL_MODEL = "all-MiniLM-L6-v2"
_embedder = None
_embedder_load_error: Optional[str] = None


def _get_embedder():
    global _embedder, _embedder_load_error
    if _embedder is not None:
        return _embedder
    if _embedder_load_error is not None:
        raise HTTPException(status_code=500, detail=_embedder_load_error)
    try:
        from sentence_transformers import SentenceTransformer

        _embedder = SentenceTransformer(RETRIEVAL_MODEL)
    except Exception as exc:
        _embedder_load_error = (
            f"Failed to load retrieval model {RETRIEVAL_MODEL}: {exc}"
        )
        raise HTTPException(status_code=500, detail=_embedder_load_error) from exc
    return _embedder


def _retrieve_passages(text: str, question: str, top_k: int) -> list[dict]:
    spans = collect_sentence_spans(text)
    if not spans:
        raise HTTPException(
            status_code=500,
            detail="Document text has no processable sentence chunks for retrieval",
        )

    embedder = _get_embedder()
    try:
        from sentence_transformers import util

        chunk_texts = [s["text"] for s in spans]
        embeddings = embedder.encode(
            chunk_texts + [question],
            convert_to_tensor=True,
            show_progress_bar=False,
        )
        chunk_embeddings = embeddings[:-1]
        question_embedding = embeddings[-1:]
        scores = util.cos_sim(question_embedding, chunk_embeddings)[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Passage retrieval failed: {exc}",
        ) from exc

    ranked = sorted(
        zip(spans, scores.tolist()),
        key=lambda item: item[1],
        reverse=True,
    )[: max(1, top_k)]

    passages = []
    for span, score in ranked:
        passages.append(
            {
                "text": span["text"],
                "score": round(float(score), 4),
                "char_start": span["char_start"],
                "char_end": span["char_end"],
            }
        )
    return passages

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

_MARKITDOWN = MarkItDown(enable_plugins=False)
MARKITDOWN_EXTENSIONS = frozenset({".docx", ".pptx", ".xlsx", ".txt", ".html", ".htm"})
UPLOAD_EXTENSIONS = MARKITDOWN_EXTENSIONS | {".pdf"}


def _upload_extension(filename: Optional[str]) -> str:
    if not filename:
        return ""
    return Path(filename).suffix.lower()


def _pdf_pages_from_content(content: bytes) -> tuple[str, list[dict]]:
    doc = fitz.open(stream=content, filetype="pdf")
    pages: list[dict] = []
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
    return full_text, pages


def _markitdown_text_from_content(content: bytes, ext: str) -> str:
    result = _MARKITDOWN.convert_stream(
        io.BytesIO(content),
        file_extension=ext,
    )
    return result.text_content or ""


def _single_text_page(full_text: str) -> list[dict]:
    return [{
        "page_number": 1,
        "text": full_text,
        "char_start": 0,
        "char_end": len(full_text),
        "width": 0.0,
        "height": 0.0,
    }]


def _build_upload_response(content: bytes, filename: Optional[str]) -> dict:
    digest = hashlib.sha256(content).hexdigest()[:16]
    ext = _upload_extension(filename)

    if ext == ".pdf":
        full_text, pages = _pdf_pages_from_content(content)
    elif ext in MARKITDOWN_EXTENSIONS:
        full_text = _markitdown_text_from_content(content, ext)
        pages = _single_text_page(full_text)
    else:
        supported = ", ".join(sorted(UPLOAD_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext or 'unknown'}. Supported: {supported}",
        )

    return {
        "document_id": digest,
        "filename": filename,
        "page_count": len(pages),
        "full_text": full_text,
        "pages": pages,
    }


async def _read_and_upload(file: UploadFile) -> dict:
    content = await file.read()
    try:
        return _build_upload_response(content, file.filename)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    return await _read_and_upload(file)


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    ext = _upload_extension(file.filename)
    if ext and ext != ".pdf":
        raise HTTPException(status_code=400, detail="upload-pdf accepts PDF files only")
    return await _read_and_upload(file)

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
    document_id: Optional[str] = None
    text: str
    question: str
    top_k: Optional[int] = 3

@app.post("/ask-document")
def ask_document(req: AskDocumentRequest):
    try:
        text = req.text.strip()
        question = req.question.strip()
        top_k = req.top_k or 3

        if not text:
            raise HTTPException(status_code=400, detail="Document text is required")
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")

        passages = _retrieve_passages(text, question, top_k)

        return {
            "question": question,
            "passages": passages,
            "retrieval_model": RETRIEVAL_MODEL,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExportFhirEntity(BaseModel):
    text: str
    label: str
    confidence: float = 0.0
    start: int = 0
    end: int = 0

class ExportFhirDocMeta(BaseModel):
    title: Optional[str] = None
    page_count: Optional[int] = None
    analyzed_with: Optional[str] = None
    analyzed_at: Optional[str] = None

class ExportFhirRequest(BaseModel):
    entities: list[ExportFhirEntity]
    doc_meta: Optional[ExportFhirDocMeta] = None

@app.post("/export-fhir")
def export_fhir(req: ExportFhirRequest):
    from fhir_gate import FhirGateError, entities_to_fhir

    if not req.entities:
        raise HTTPException(status_code=400, detail="At least one entity is required")

    try:
        payload = [e.model_dump() for e in req.entities]
        meta = req.doc_meta.model_dump(exclude_none=True) if req.doc_meta else {}
        return entities_to_fhir(payload, meta)
    except FhirGateError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
