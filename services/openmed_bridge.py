from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openmed
import uvicorn

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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
