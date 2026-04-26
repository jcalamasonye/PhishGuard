from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import uvicorn
from typing import List, Dict
import os

# Initialize FastAPI
app = FastAPI(
    title="PhishGuard AI API",
    description="AI-powered phishing email detection using ensemble ML models",
    version="2.0.0"
)

# CORS middleware (allow frontend to call this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
rf_model = None
rf_vectorizer = None
bert_model = None
bert_tokenizer = None

# Model weights for ensemble
RF_WEIGHT = 0.35
BERT_WEIGHT = 0.65


class EmailRequest(BaseModel):
    """Request schema for email analysis"""
    email_text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email_text": "URGENT! Your account has been suspended. Click here to verify: http://suspicious-link.com"
            }
        }


class AnalysisResponse(BaseModel):
    """Response schema for email analysis"""
    is_phishing: bool
    phishing_probability: float
    safe_probability: float
    risk_level: str
    confidence: float
    model_breakdown: Dict[str, float]
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_phishing": True,
                "phishing_probability": 94.8,
                "safe_probability": 5.2,
                "risk_level": "CRITICAL",
                "confidence": 94.8,
                "model_breakdown": {
                    "random_forest": 85.7,
                    "distilbert": 99.6,
                    "ensemble": 94.8
                }
            }
        }


def get_risk_level(probability: float) -> str:
    """Determine risk level based on phishing probability"""
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
    """Load both ML models on startup"""
    global rf_model, rf_vectorizer, bert_model, bert_tokenizer
    
    try:
        # Load Random Forest model
        print("Loading Random Forest model...")
        rf_model = joblib.load('models/phishguard_v1.0.pkl')
        rf_vectorizer = joblib.load('models/vectorizer_v1.0.pkl')
        print("✓ Random Forest loaded")
        
        # Load DistilBERT model
        print("Loading DistilBERT model...")
        bert_tokenizer = AutoTokenizer.from_pretrained('models/distilbert')
        bert_model = AutoModelForSequenceClassification.from_pretrained('models/distilbert')
        bert_model.eval()  # Set to evaluation mode
        print("✓ DistilBERT loaded")
        
        print("All models loaded successfully!")
        
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise


def analyze_with_random_forest(email_text: str) -> float:
    """Analyze email with Random Forest model"""
    features = rf_vectorizer.transform([email_text])
    probability = rf_model.predict_proba(features)[0][1]
    return float(probability * 100)


def analyze_with_bert(email_text: str) -> float:
    """Analyze email with DistilBERT model"""
    inputs = bert_tokenizer(
        email_text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    )
    
    with torch.no_grad():
        outputs = bert_model(**inputs)
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        phishing_prob = probabilities[0][1].item()
    
    return float(phishing_prob * 100)


@app.get("/")
async def root():
    """API information endpoint"""
    return {
        "name": "PhishGuard AI API",
        "version": "2.0.0",
        "status": "active",
        "models": {
            "random_forest": "v1.0 - Traditional ML",
            "distilbert": "v1.0 - Deep Learning",
            "ensemble": f"{RF_WEIGHT*100:.0f}% RF + {BERT_WEIGHT*100:.0f}% BERT"
        },
        "endpoints": {
            "analyze": "POST /analyze - Analyze single email",
            "health": "GET /health - Health check",
            "docs": "GET /docs - API documentation"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = all([rf_model, rf_vectorizer, bert_model, bert_tokenizer])
    
    return {
        "status": "healthy" if models_loaded else "unhealthy",
        "models_loaded": models_loaded,
        "random_forest": rf_model is not None,
        "distilbert": bert_model is not None
    }


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_email(request: EmailRequest):
    """
    Analyze an email for phishing using ensemble model
    
    Combines Random Forest (35%) and DistilBERT (65%) predictions
    for optimal accuracy and generalization
    """
    
    if not request.email_text or len(request.email_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Email text cannot be empty")
    
    try:
        # Get predictions from both models
        rf_score = analyze_with_random_forest(request.email_text)
        bert_score = analyze_with_bert(request.email_text)
        
        # Ensemble prediction (weighted average)
        ensemble_score = (RF_WEIGHT * rf_score) + (BERT_WEIGHT * bert_score)
        
        # Determine if phishing
        is_phishing = ensemble_score >= 50.0
        
        # Calculate probabilities
        phishing_prob = round(ensemble_score, 2)
        safe_prob = round(100 - ensemble_score, 2)
        
        # Determine risk level
        risk_level = get_risk_level(phishing_prob)
        
        return AnalysisResponse(
            is_phishing=is_phishing,
            phishing_probability=phishing_prob,
            safe_probability=safe_prob,
            risk_level=risk_level,
            confidence=phishing_prob if is_phishing else safe_prob,
            model_breakdown={
                "random_forest": round(rf_score, 2),
                "distilbert": round(bert_score, 2),
                "ensemble": round(ensemble_score, 2)
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing email: {str(e)}"
        )


@app.post("/batch-analyze")
async def batch_analyze(emails: List[EmailRequest]):
    """
    Analyze multiple emails in batch
    
    Useful for processing large volumes of emails
    """
    if len(emails) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 emails per batch request"
        )
    
    results = []
    for email in emails:
        try:
            result = await analyze_email(email)
            results.append(result)
        except Exception as e:
            results.append({
                "error": str(e),
                "email_preview": email.email_text[:50] + "..."
            })
    
    return {
        "total": len(emails),
        "processed": len(results),
        "results": results
    }


if __name__ == "__main__":
    # Run the API server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False  # Set to False in production
    )