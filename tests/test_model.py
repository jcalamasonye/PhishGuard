import sys
sys.path.append('.')

import joblib
import pytest

model = joblib.load('models/phishguard_v1.0.pkl')
vectorizer = joblib.load('models/vectorizer_v1.0.pkl')

def predict(text):
    features = vectorizer.transform([text])
    return model.predict(features)[0]

def test_phishing_paypal():
    email = 'URGENT: Your PayPal account suspended. Click http://paypa1.com'
    assert predict(email) == 1, 'Should detect PayPal phishing'

def test_phishing_prize():
    email = 'You won 1 million dollars! Send bank details now!'
    assert predict(email) == 1, 'Should detect prize scam'

def test_legitimate_work():
    email = 'Hi team, meeting tomorrow at 2pm in conference room B'
    assert predict(email) == 0, 'Should recognize work email'

def test_legitimate_order():
    email = 'Your order #12345 has shipped and will arrive Friday'
    assert predict(email) == 0, 'Should recognize order confirmation'

def test_legitimate_saas():
    email = 'Welcome to CloudApp! We have unlocked premium features for 30 days'
    assert predict(email) == 0, 'Should recognize SaaS marketing'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
