import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import FunctionTransformer
import joblib
import re
import warnings
warnings.filterwarnings('ignore')

print('=' * 70)
print('PHISHGUARD AI - WORLD CLASS MODEL TRAINING')
print('=' * 70)

# ── LOAD DATA ─────────────────────────────────────────────────
df = pd.read_csv('/home/claude/ai-project/data/processed/world_class_training_data.csv')
df = df.dropna(subset=['email_text', 'label'])
df['email_text'] = df['email_text'].astype(str)
df['label'] = df['label'].astype(int)

print(f"\n[1] Dataset loaded: {len(df):,} emails")
print(f"    Phishing:    {len(df[df.label==1]):,}")
print(f"    Legitimate:  {len(df[df.label==0]):,}")

# ── FEATURE ENGINEERING ──────────────────────────────────────
def extract_phishing_features(texts):
    """Extract hand-crafted phishing signal features"""
    features = []
    for text in texts:
        text_lower = text.lower()
        f = {
            # URL signals
            'has_url': int(bool(re.search(r'https?://', text_lower))),
            'has_suspicious_url': int(bool(re.search(r'http[s]?://(?!(?:www\.)?(amazon|google|microsoft|apple|paypal|chase|wellsfargo|netflix|github|spotify|uber|dropbox|slack|notion|stripe|airbnb|coursera|linkedin|facebook|twitter|instagram|youtube|zoom|salesforce|hubspot|zendesk|railway|vercel|resend)\.(?:com|org|edu|gov|io|app))', text_lower))),
            'url_has_ip': int(bool(re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', text_lower))),
            'has_shortened_url': int(bool(re.search(r'bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd', text_lower))),
            
            # Urgency signals
            'has_urgent': int(bool(re.search(r'\burgent\b|\bimmediately\b|\bright away\b|\basap\b|\bimminent\b', text_lower))),
            'has_deadline': int(bool(re.search(r'\d+\s*hours?\b|\d+\s*minutes?\b|today|by\s+\d|expires?\s+in', text_lower))),
            'has_suspend': int(bool(re.search(r'\bsuspend\b|\bdisable\b|\bblock\b|\blimit\b|\bterminat\b', text_lower))),
            'has_final': int(bool(re.search(r'\bfinal\b|\blast chance\b|\bwarning\b|\bnotice\b', text_lower))),
            
            # Financial signals
            'has_money': int(bool(re.search(r'\$[\d,]+|\bpay\b|\bpayment\b|\bwire\b|\btransfer\b|\bbank\b|\brefund\b', text_lower))),
            'has_fee': int(bool(re.search(r'\bfee\b|\bcost\b|\bcharge\b|\binvoice\b|\bdue\b', text_lower))),
            'has_prize': int(bool(re.search(r'\bwon\b|\bwinner\b|\bprize\b|\bcongratuations\b|\blottery\b|\baward\b', text_lower))),
            
            # Credential signals
            'has_verify': int(bool(re.search(r'\bverify\b|\bconfirm\b|\bvalidate\b|\bauthenticate\b', text_lower))),
            'has_password': int(bool(re.search(r'\bpassword\b|\bpasscode\b|\bpin\b|\bcredential\b', text_lower))),
            'has_ssn': int(bool(re.search(r'\bsocial security\b|\bssn\b|\bdate of birth\b|\bdob\b', text_lower))),
            'has_account_info': int(bool(re.search(r'\baccount number\b|\brouting\b|\bcredit card\b|\bdebit card\b', text_lower))),
            
            # Sender signals  
            'has_legitimate_sender': int(bool(re.search(r'@(?:amazon|google|microsoft|apple|paypal|chase|wellsfargo|netflix|github|spotify|uber|dropbox|slack|notion|stripe|airbnb|coursera|linkedin|facebook|railway|vercel|resend|github|zendesk)\.(?:com|org|io|app|net)', text_lower))),
            'has_suspicious_sender': int(bool(re.search(r'@.*(?:security-alert|account-alert|billing-update|support-center|fraud-dept|noreply.*(?!amazon|google|microsoft|apple|stripe)).*\.(?:net|org|info|biz|ru|cn)', text_lower))),
            
            # Content signals
            'has_click_link': int(bool(re.search(r'\bclick\s+(?:here|the link|below|button)\b', text_lower))),
            'has_action_required': int(bool(re.search(r'\baction required\b|\bresponse required\b|\bimmediate action\b', text_lower))),
            'has_confidential': int(bool(re.search(r'\bconfidential\b|\bsecret\b|\bdo not share\b|\bnda\b', text_lower))),
            'has_threat': int(bool(re.search(r'\bprosecute\b|\binvestigation\b|\blegal action\b|\bcriminal\b|\barrest\b', text_lower))),
            
            # Legitimate signals
            'has_unsubscribe': int(bool(re.search(r'\bunsubscribe\b|\bopt.out\b|\bmanage.*preference\b', text_lower))),
            'has_privacy_policy': int(bool(re.search(r'\bprivacy policy\b|\bterms of service\b|\bterms and conditions\b', text_lower))),
            'has_physical_address': int(bool(re.search(r'\d+\s+\w+\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|way|lane|ln)\b', text_lower))),
            'has_greeting': int(bool(re.search(r'^(?:hi|hello|hey|dear|good morning|good afternoon|greetings)\b', text_lower))),
            'has_signature': int(bool(re.search(r'\bbest regards\b|\bsincerely\b|\bkind regards\b|\bcheers\b|\bthanks\b|\bthank you\b', text_lower))),
            
            # Text statistics
            'text_length': min(len(text), 5000),
            'word_count': len(text.split()),
            'exclamation_count': text.count('!'),
            'caps_ratio': sum(1 for c in text if c.isupper()) / max(len(text), 1),
            'has_html': int('<html' in text_lower or '<body' in text_lower or '<a href' in text_lower),
        }
        features.append(f)
    return pd.DataFrame(features).values

print("\n[2] Extracting phishing signal features...")

# ── PREPARE DATA ──────────────────────────────────────────────
X_text = df['email_text'].values
X_features = extract_phishing_features(X_text)
y = df['label'].values

X_train_text, X_test_text, X_train_feat, X_test_feat, y_train, y_test = train_test_split(
    X_text, X_features, y, test_size=0.2, random_state=42, stratify=y
)

print(f"    Training: {len(X_train_text):,} | Test: {len(X_test_text):,}")

# ── TFIDF VECTORIZER ──────────────────────────────────────────
print("\n[3] Building TF-IDF features...")
vectorizer = TfidfVectorizer(
    max_features=15000,
    ngram_range=(1, 3),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True,
    strip_accents='unicode',
    analyzer='word',
    token_pattern=r'\b[a-zA-Z0-9][a-zA-Z0-9._%+-]{1,}\b',
    stop_words=None,  # Keep all words - phishing uses stop words differently
)

X_train_tfidf = vectorizer.fit_transform(X_train_text)
X_test_tfidf = vectorizer.transform(X_test_text)

# Combine TF-IDF with hand-crafted features
from scipy.sparse import hstack, csr_matrix
X_train_combined = hstack([X_train_tfidf, csr_matrix(X_train_feat)])
X_test_combined = hstack([X_test_tfidf, csr_matrix(X_test_feat)])

print(f"    Feature dimensions: {X_train_combined.shape[1]:,}")

# ── TRAIN ENSEMBLE MODEL ──────────────────────────────────────
print("\n[4] Training ensemble model...")

# Logistic Regression - excellent for text
lr = LogisticRegression(
    C=1.0,
    class_weight='balanced',
    max_iter=1000,
    random_state=42,
    solver='lbfgs',
)

# Random Forest - captures non-linear patterns
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
)

# Linear SVM - state of the art for text classification
svm = CalibratedClassifierCV(
    LinearSVC(
        C=0.1,
        class_weight='balanced',
        max_iter=2000,
        random_state=42,
    )
)

# Voting ensemble
ensemble = VotingClassifier(
    estimators=[
        ('lr', lr),
        ('rf', rf),
        ('svm', svm),
    ],
    voting='soft',
    weights=[2, 1, 2],  # LR and SVM weighted higher for text
)

ensemble.fit(X_train_combined, y_train)

# ── EVALUATE ──────────────────────────────────────────────────
print("\n[5] Evaluating model...")
y_pred = ensemble.predict(X_test_combined)
y_proba = ensemble.predict_proba(X_test_combined)

acc = accuracy_score(y_test, y_pred)
print(f"\n    Test Accuracy: {acc*100:.2f}%")
print(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing'])}")

cm = confusion_matrix(y_test, y_pred)
print(f"    Confusion Matrix:")
print(f"    True Neg (correctly safe):     {cm[0][0]}")
print(f"    False Pos (safe→phishing):     {cm[0][1]}")
print(f"    False Neg (phishing→safe):     {cm[1][0]}")
print(f"    True Pos (correctly phishing): {cm[1][1]}")

# ── TEST ON REAL-WORLD EMAILS ──────────────────────────────────
print("\n[6] Real-world validation...")

test_emails = [
    # Should be PHISHING
    ("PHISHING", "Microsoft 365 urgent", "Dear User, Your Microsoft 365 password is scheduled to expire in 24 hours. To avoid losing access to your email, Teams, SharePoint, and other Microsoft services, you must update your password immediately. Click here to update: http://microsoft365-secure-update.suspicious-domain.com/password"),
    ("PHISHING", "CEO wire transfer", "Hi Sarah, I need your help with something time-sensitive and confidential. I am currently in a board meeting. We need to process a wire transfer of $47,250 USD today. Beneficiary: Meridian Capital Partners. Account: 8472910364. Please process before 3 PM and confirm by email. Do not discuss with anyone. James Richardson, CEO"),
    ("PHISHING", "Chase bank alert", "Security Alert: Suspicious transaction detected on your Chase account. Amount: $847.50 USD from Lagos Nigeria. Your account has been temporarily limited. Verify your identity within 2 hours to restore access: http://chase-account-alerts.com/verify"),
    ("PHISHING", "HR payroll scam", "URGENT: All employees must re-verify direct deposit information by Friday at noon. Our payroll system is migrating. Failure to update will delay your paycheck. Provide your bank routing number, account number, and last 4 digits of SSN here: http://company-payroll-portal.net/update"),
    ("PHISHING", "FedEx delivery fee", "FedEx: Package delivery failed. Tracking FX-2847-9012. A redelivery fee of $1.99 is required to reschedule. Click to pay: http://fedex-redelivery-payment.scam.com/pay"),
    ("PHISHING", "Lottery winner", "CONGRATULATIONS! You have been selected as the GRAND PRIZE WINNER of $500,000 in our International Promotion. To claim your prize, send your full name, address, and a processing fee of $250. Contact: claims@cocacola-prize-dept.com"),
    ("PHISHING", "IRS refund", "Internal Revenue Service: You are entitled to a tax refund of $2,847.00 for 2025. To receive your refund, verify your Social Security Number and bank account at: http://irs-tax-refund-claim.fraudulent.com/claim"),
    ("PHISHING", "LinkedIn verify", "Your LinkedIn profile appeared in 47 searches this week. Your account requires verification to continue showing in recruiter results. Unverified accounts are being removed on May 1st. Verify now: http://linkedin-account-verify.phishing-domain.com"),
    
    # Should be LEGITIMATE (including the Resend welcome email)
    ("LEGITIMATE", "Resend welcome", """Welcome to Resend!
Zeno Rocha <zeno.rocha@resend.com>
Hey,
My name is Zeno — I'm the founder and CEO of Resend.
We started Resend because we wanted a better email API for developers. A simple, fast, and elegant interface that just works.
Here are 3 tips to get started.
1. Send your first email
2. Add your domain
3. Check the docs
P.S.: Why did you sign up? What brought you here?
Hit "Reply" and let me know. I read and reply to every email.
Cheers, Zeno"""),
    ("LEGITIMATE", "Team meeting", "Hi everyone, following up from yesterday's Q3 performance review. Here are the key action items: Marketing to finalize campaign brief by April 30th. Engineering to complete API integration by May 15th. Please reply to confirm you've received your action items. Best regards, Sarah Mitchell, VP of Operations"),
    ("LEGITIMATE", "Amazon order shipped", "Hello Customer, Your Amazon order #113-8492847 has shipped! Item: Sony WH-1000XM5 Headphones - $299.99. Estimated delivery: April 26-27. Tracking: 1Z999AA10123456784. Track at ups.com/track. Thank you for shopping with us. Amazon.com"),
    ("LEGITIMATE", "GitHub security alert", "Hey developer, A new SSH key was added to your GitHub account. Key added: April 24, 2026. If you added this key, you can safely disregard this email. If you did NOT add this key, please visit github.com/settings/keys immediately. The GitHub Team"),
    ("LEGITIMATE", "Google sign-in legit", "Your Google Account was just signed in to from a new device. Device: MacBook Pro. Location: San Francisco, CA, USA. If this was you, you can ignore this email. If this wasn't you, check your account at myaccount.google.com. The Google Accounts Team. Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043"),
    ("LEGITIMATE", "Personal email", "Hey Mike! Saturday works perfectly for me. I checked out that Italian restaurant you mentioned - Trattoria Roma - and the reviews look great. I was thinking we could meet around 7pm. Can you make a reservation through OpenTable? Let me know! Alex"),
    ("LEGITIMATE", "Mom email", "Hi sweetheart, I wanted to reach out about Thanksgiving. Your Aunt Carol and Uncle Pete are coming this year along with their kids. Could you let me know if you're planning to come? Your sister said she can't make it this year because of work. Dad sends his love. Love you lots, Mom"),
]

print(f"\n{'Email Type':<12} {'Expected':<12} {'Got':<12} {'Confidence':<12} {'Subject'}")
print("-" * 75)
correct = 0
for expected, subject, email in test_emails:
    feat = extract_phishing_features([email])
    tfidf = vectorizer.transform([email])
    combined = hstack([tfidf, csr_matrix(feat)])
    pred = ensemble.predict(combined)[0]
    proba = ensemble.predict_proba(combined)[0]
    
    got = "PHISHING" if pred == 1 else "LEGITIMATE"
    confidence = proba[1]*100 if pred == 1 else proba[0]*100
    status = "✓" if got == expected else "✗"
    if got == expected:
        correct += 1
    print(f"{status} {expected:<12} {got:<12} {confidence:.1f}%{'':8} {subject[:35]}")

print(f"\nReal-world accuracy: {correct}/{len(test_emails)} ({correct/len(test_emails)*100:.1f}%)")

# ── SAVE MODEL ────────────────────────────────────────────────
print("\n[7] Saving world-class model...")

# Save the full pipeline components
joblib.dump(ensemble, '/home/claude/ai-project/models/phishguard_v2.0.pkl')
joblib.dump(vectorizer, '/home/claude/ai-project/models/vectorizer_v2.0.pkl')

# Save feature extractor info
import json
with open('/home/claude/ai-project/models/model_info.json', 'w') as f:
    json.dump({
        'version': '2.0',
        'type': 'ensemble (LR + RF + SVM)',
        'features': 'TF-IDF (15k) + 28 hand-crafted phishing signals',
        'training_samples': len(df),
        'test_accuracy': f'{acc*100:.2f}%',
    }, f, indent=2)

print("  ✓ Saved models/phishguard_v2.0.pkl")
print("  ✓ Saved models/vectorizer_v2.0.pkl")
print("  ✓ Saved models/model_info.json")
print("\n" + "=" * 70)
print("WORLD CLASS TRAINING COMPLETE!")
print("=" * 70)
