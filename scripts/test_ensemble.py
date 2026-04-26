import joblib
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

class PhishGuardEnsemble:
    def __init__(self):
        # Load Random Forest
        self.rf_model = joblib.load('models/phishguard_v1.0.pkl')
        self.vectorizer = joblib.load('models/vectorizer_v1.0.pkl')
        
        # Load DistilBERT
        self.bert_model = DistilBertForSequenceClassification.from_pretrained('models/distilbert')
        self.tokenizer = DistilBertTokenizer.from_pretrained('models/distilbert')
        self.bert_model.eval()
    
    def predict(self, email_text):
        # Random Forest prediction
        rf_features = self.vectorizer.transform([email_text])
        rf_probs = self.rf_model.predict_proba(rf_features)[0]
        
        # DistilBERT prediction
        inputs = self.tokenizer(email_text, return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            bert_outputs = self.bert_model(**inputs)
            bert_probs = torch.softmax(bert_outputs.logits, dim=1)[0].numpy()
        
        # Ensemble: 35% RF + 65% BERT
        final_probs = 0.35 * rf_probs + 0.65 * bert_probs
        prediction = int(final_probs[1] > 0.5)
        
        return {
            'is_phishing': bool(prediction),
            'phishing_probability': float(final_probs[1] * 100),
            'safe_probability': float(final_probs[0] * 100),
            'rf_contribution': float(rf_probs[1] * 100),
            'bert_contribution': float(bert_probs[1] * 100)
        }

if __name__ == '__main__':
    ensemble = PhishGuardEnsemble()
    
    # Test on unseen brands
    tests = [
        'URGENT: Your Shopify store suspended. Verify at http://shop1fy.com',
        'Your Revolut account frozen. Click here: http://revolut-security.net',
        'Hi team, meeting tomorrow at 2pm in conference room'
    ]
    
    for email in tests:
        result = ensemble.predict(email)
        print(f'\nEmail: {email[:60]}...')
        print(f'Verdict: {'PHISHING' if result['is_phishing'] else 'SAFE'}')
        print(f'Confidence: {max(result['phishing_probability'], result['safe_probability']):.1f}%')
        print(f'RF says: {result['rf_contribution']:.1f}% phishing')
        print(f'BERT says: {result['bert_contribution']:.1f}% phishing')
