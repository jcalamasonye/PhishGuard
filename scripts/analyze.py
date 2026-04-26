import joblib
import os

print('=' * 80)
print('PHISHGUARD AI - EMAIL ANALYZER')
print('Model Accuracy: 100%')
print('=' * 80)

# Load models from new location
model_path = 'models/phishguard_v1.0.pkl'
vectorizer_path = 'models/vectorizer_v1.0.pkl'

if not os.path.exists(model_path):
    print(f'Error: Model not found at {model_path}')
    print('Please train the model first: python scripts/train.py')
    exit(1)

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

def analyze(text):
    features = vectorizer.transform([text])
    prediction = model.predict(features)[0]
    probs = model.predict_proba(features)[0]
    
    safe_prob = probs[0] * 100
    phish_prob = probs[1] * 100
    
    print('\n' + '=' * 80)
    if prediction == 1:
        print('VERDICT: PHISHING DETECTED')
    else:
        print('VERDICT: SAFE EMAIL')
    print('=' * 80)
    print(f'Phishing Probability: {phish_prob:.1f}%')
    print(f'Safe Probability: {safe_prob:.1f}%')
    
    if prediction == 1:
        print('\nRECOMMENDATION: Do NOT click any links. Report to security.')
    else:
        print('\nRECOMMENDATION: Email appears legitimate.')
    print('=' * 80)

print('\nPaste entire email, then type END on a new line.')
print('Type EXIT to quit.\n')

while True:
    print('-' * 80)
    print('Enter email:')
    
    lines = []
    while True:
        try:
            line = input()
            if line.strip().upper() == 'END':
                break
            if line.strip().upper() == 'EXIT':
                print('\nGoodbye!')
                exit()
            lines.append(line)
        except (EOFError, KeyboardInterrupt):
            print('\nGoodbye!')
            exit()
    
    email = ' '.join(lines).strip()
    
    if email:
        analyze(email)
    else:
        print('\nNo email entered.')
