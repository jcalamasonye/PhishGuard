from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from scipy.sparse import hstack, csr_matrix
import uvicorn
from typing import List, Dict
import os
import re

app = FastAPI(
    title="PhishGuard AI API",
    description="AI-powered phishing email detection — 98.9% accuracy ensemble model",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
model = None
vectorizer = None

LEGIT_DOMAINS = r'amazon|google|microsoft|apple|paypal|chase|wellsfargo|netflix|github|spotify|uber|stripe|airbnb|linkedin|facebook|railway|vercel|resend|zendesk|hubspot|notion|dropbox|slack|coursera|pagerduty|zoom|shopify|heroku|netlify|circleci|datadog|render|aws'

def extract_features(texts):
    """Extract 30 hand-crafted phishing signal features"""
    out = []
    for t in texts:
        tl = t.lower()
        out.append([
            int(bool(re.search(r'https?://', tl))),
            int(bool(re.search(r'https?://(?!(?:www\.)?(' + LEGIT_DOMAINS + r')\.(?:com|org|io|app|net|edu|gov))', tl))),
            int(bool(re.search(r'https?://\d{1,3}\.\d{1,3}', tl))),
            int(bool(re.search(r'bit\.ly|tinyurl|goo\.gl', tl))),
            int(bool(re.search(r'\burgent\b|\bimmediately\b|\bright away\b', tl))),
            int(bool(re.search(r'\d+\s*hours?\b|\bexpires?\b|\bdeadline\b', tl))),
            int(bool(re.search(r'\bsuspend\b|\bdisable\b|\bblock\b|\blocked\b|\blimited\b', tl))),
            int(bool(re.search(r'\$[\d,]+|\bwire transfer\b|\bbank account\b', tl))),
            int(bool(re.search(r'\bwon\b|\bwinner\b|\bprize\b|\blottery\b', tl))),
            int(bool(re.search(r'\bverify\b|\bconfirm\b|\bvalidate\b', tl))),
            int(bool(re.search(r'\bpassword\b|\bcredential\b', tl))),
            int(bool(re.search(r'\bsocial security\b|\bssn\b|\bdate of birth\b', tl))),
            int(bool(re.search(r'\baccount number\b|\brouting number\b|\bcredit card\b', tl))),
            int(bool(re.search(r'\bclick here\b|\bclick the link\b|\bclick below\b', tl))),
            int(bool(re.search(r'\baction required\b|\bimmediate action\b', tl))),
            int(bool(re.search(r'\bconfidential\b|\bnda\b|\bdo not discuss\b', tl))),
            int(bool(re.search(r'\bprosecute\b|\binvestigation\b|\bcriminal\b', tl))),
            int(bool(re.search(r'\brefund\b|\btax refund\b|\bclaim your\b', tl))),
            int(bool(re.search(r'@(?:' + LEGIT_DOMAINS + r')\.(?:com|org|io|app|net)', tl))),
            int(bool(re.search(r'\bunsubscribe\b|\bprivacy policy\b|\bterms of service\b', tl))),
            int(bool(re.search(r'\d+\s+\w+\s+(?:street|st|avenue|ave|road|rd|blvd|drive|dr)\b', tl))),
            int(bool(re.search(r'\bbest regards\b|\bsincerely\b|\bcheers\b', tl))),
            int(bool(re.search(r'\bprocessing fee\b|\bactivation fee\b|\brelease fee\b', tl))),
            int(bool(re.search(r'\bfinal notice\b|\blast warning\b|\bfinal warning\b', tl))),
            int(bool(re.search(r'\bdeployment\b|\bbuild\b|\bci/cd\b|\bcommit\b|\bpipeline\b', tl))),
            int(bool(re.search(r'\bsucceeded\b|\bpassed\b|\bsuccess\b|\bresolved\b|\blive\b', tl))),
            min(len(t), 5000) / 5000.0,
            min(len(t.split()), 1000) / 1000.0,
            min(t.count('!'), 10) / 10.0,
            sum(1 for c in t if c.isupper()) / max(len(t), 1),
        ])
    return np.array(out)


class EmailRequest(BaseModel):
    email_text: str

    class Config:
        json_schema_extra = {
            "example": {
                "email_text": "URGENT! Your account has been suspended. Click here: http://suspicious-link.com"
            }
        }


class AnalysisResponse(BaseModel):
    is_phishing: bool
    phishing_probability: float
    safe_probability: float
    risk_level: str
    confidence: float
    model_breakdown: Dict[str, float]


def get_risk_level(probability: float) -> str:
    if probability >= 80:
        return "CRITICAL"
    elif probability >= 60:
        return "HIGH"
    elif probability >= 40:
        return "MEDIUM"
    else:
        return "LOW"


@app.on_event("startup")
async def load_models():
    global model, vectorizer
    try:
        print("Loading PhishGuard AI v2.0 ensemble model...")
        model = joblib.load('models/phishguard_v2.0.pkl')
        vectorizer = joblib.load('models/vectorizer_v2.0.pkl')
        print("Models loaded successfully — 98.9% accuracy ensemble ready")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise


@app.get("/")
async def root():
    return {
        "name": "PhishGuard AI API",
        "version": "2.0.0",
        "status": "active",
        "model": "Ensemble (Logistic Regression + SVM + Random Forest)",
        "accuracy": "98.9%",
        "features": "TF-IDF (15k n-grams) + 30 hand-crafted phishing signals",
        "endpoints": {
            "analyze": "POST /analyze",
            "batch": "POST /batch-analyze",
            "health": "GET /health",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
async def health_check():
    models_loaded = model is not None and vectorizer is not None
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
        "model_type": "ensemble LR+SVM+RF",
        "version": "2.0.0"
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_email(request: EmailRequest):
    if not request.email_text or len(request.email_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Email text cannot be empty")

    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    try:
        text = request.email_text.strip()

        # Extract features
        hand_features = csr_matrix(extract_features([text]))
        tfidf_features = vectorizer.transform([text])
        combined = hstack([tfidf_features, hand_features])

        # Get ensemble prediction
        pred = model.predict(combined)[0]
        proba = model.predict_proba(combined)[0]

        phishing_prob = round(float(proba[1]) * 100, 2)
        safe_prob = round(float(proba[0]) * 100, 2)
        is_phishing = bool(pred == 1)
        risk_level = get_risk_level(phishing_prob)
        confidence = phishing_prob if is_phishing else safe_prob

        # Individual model scores for breakdown
        lr_score = round(float(model.estimators_[0].predict_proba(combined)[0][1]) * 100, 2)
        svm_score = round(float(model.estimators_[1].predict_proba(combined)[0][1]) * 100, 2)
        rf_score = round(float(model.estimators_[2].predict_proba(combined)[0][1]) * 100, 2)

        return AnalysisResponse(
            is_phishing=is_phishing,
            phishing_probability=phishing_prob,
            safe_probability=safe_prob,
            risk_level=risk_level,
            confidence=confidence,
            model_breakdown={
                "logistic_regression": lr_score,
                "svm": svm_score,
                "random_forest": rf_score,
                "ensemble": phishing_prob,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/batch-analyze")
async def batch_analyze(emails: List[EmailRequest]):
    if len(emails) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 emails per batch")

    results = []
    for email in emails:
        try:
            result = await analyze_email(email)
            results.append(result)
        except Exception as e:
            results.append({"error": str(e)})

    return {"total": len(emails), "processed": len(results), "results": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
