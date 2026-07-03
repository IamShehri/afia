from fastapi import FastAPI, HTTPException
from fastapi import File, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openmed
import uvicorn
import fitz  # PyMuPDF
import hashlib
import io
import re
from collections import Counter

app = FastAPI(title="AFIA OpenMed Bridge", version="1.0.0")

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
def list_models():
    all_models = openmed.list_models()
    grouped = {
        "ner": [],
        "pii": [],
        "zeroshot": [],
        "other": []
    }
    for m in all_models:
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

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        if req.model:
            result = openmed.analyze_text(req.text, model_name=req.model)
        else:
            result = openmed.analyze_text(req.text)
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
        result = openmed.deidentify(req.text, language=req.language)
        return {
            "original": req.text,
            "deidentified": result.text if hasattr(result, "text") else str(result),
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
        chunk_size = req.chunk_size
        all_entities = []
        
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            if not chunk.strip():
                continue
            if req.model:
                result = openmed.analyze_text(chunk, model_name=req.model)
            else:
                result = openmed.analyze_text(chunk)
            for e in result.entities:
                all_entities.append({
                    "text": e.text,
                    "label": e.label,
                    "confidence": e.confidence,
                    "start": e.start + i,
                    "end": e.end + i,
                })
        
        return {
            "text": text,
            "entities": all_entities,
            "chunk_count": (len(text) // chunk_size) + 1,
        }
    except Exception as e:
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
