import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import warnings
warnings.filterwarnings('ignore')

print('=' * 80)
print('PHISHGUARD AI - MODEL TRAINING')
print('=' * 80)

# Load datasets from new locations
print('\n[1] Loading datasets...\n')

df1 = pd.read_csv('data/raw/perfect_phishing_dataset.csv')
print(f'  Perfect dataset: {len(df1):,} emails')

df2 = pd.read_csv('data/raw/spam_ham_dataset.csv')
df2_clean = pd.DataFrame({
    'email_text': df2['text'],
    'label': df2['label_num']
})
print(f'  Enron dataset: {len(df2_clean):,} emails')

enron_ham = df2_clean[df2_clean.label == 0].copy()
print(f'  Using Enron legitimate: {len(enron_ham):,} emails')

# Combine
combined = pd.concat([df1, enron_ham], ignore_index=True)
combined = combined.drop_duplicates(subset=['email_text'])
combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

print(f'\n[2] Final dataset: {len(combined):,} emails\n')

# Save to processed
combined.to_csv('data/processed/final_training_data.csv', index=False)

# Train
X = combined['email_text']
y = combined['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f'[3] Training set: {len(X_train):,} | Test set: {len(X_test):,}\n')

vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,3), min_df=3, stop_words='english')
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

print(f'[4] Training model...\n')
model = RandomForestClassifier(n_estimators=500, max_depth=150, random_state=42, n_jobs=-1, class_weight='balanced')
model.fit(X_train_vec, y_train)

y_pred = model.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)

print(f'[5] Test Accuracy: {acc*100:.2f}%\n')
print(classification_report(y_test, y_pred, target_names=['Safe', 'Phishing']))

# Save models to new location
print(f'[6] Saving models...\n')
joblib.dump(model, 'models/phishguard_v1.0.pkl')
joblib.dump(vectorizer, 'models/vectorizer_v1.0.pkl')

print('  Saved models/phishguard_v1.0.pkl')
print('  Saved models/vectorizer_v1.0.pkl')
print('\n' + '=' * 80)
print('TRAINING COMPLETE!')
print('=' * 80)
