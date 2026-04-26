import pandas as pd
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

print('=' * 80)
print('PHISHGUARD AI - DISTILBERT TRAINING')
print('Adding language understanding for generalization')
print('=' * 80)

# Load data
print('\n[1] Loading dataset...\n')
df = pd.read_csv('data/processed/final_training_data.csv')
print(f'  Total: {len(df):,} emails')

# Split
X_train, X_test, y_train, y_test = train_test_split(
    df['email_text'].values,
    df['label'].values,
    test_size=0.2,
    random_state=42,
    stratify=df['label']
)

print(f'  Train: {len(X_train):,}')
print(f'  Test: {len(X_test):,}')

# Load tokenizer
print('\n[2] Loading DistilBERT tokenizer...\n')
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')

# Tokenize
print('[3] Tokenizing emails (this takes 2-3 minutes)...\n')
train_encodings = tokenizer(list(X_train), truncation=True, padding=True, max_length=512)
test_encodings = tokenizer(list(X_test), truncation=True, padding=True, max_length=512)

# Create dataset
class EmailDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    
    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item
    
    def __len__(self):
        return len(self.labels)

train_dataset = EmailDataset(train_encodings, y_train)
test_dataset = EmailDataset(test_encodings, y_test)

# Load model
print('[4] Loading DistilBERT model...\n')
model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=2)

# Compute metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    acc = accuracy_score(labels, predictions)
    return {'accuracy': acc}

# Training args
training_args = TrainingArguments(
    output_dir='./distilbert_results',
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=16,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=100,
    eval_strategy='epoch',
    save_strategy='epoch',
    load_best_model_at_end=True,
    metric_for_best_model='accuracy'
)

# Train
print('[5] Training DistilBERT (10-15 minutes on CPU, 3-5 min on GPU)...\n')
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics
)

trainer.train()

# Evaluate
print('\n[6] Evaluating...\n')
results = trainer.evaluate()
accuracy = results.get('eval_accuracy', results.get('accuracy', 0))
print(f'  Accuracy: {accuracy*100:.2f}%')

# Save
print('\n[7] Saving model...\n')
model.save_pretrained('models/distilbert')
tokenizer.save_pretrained('models/distilbert')

print('  Saved models/distilbert/')
print('\n' + '=' * 80)
print('DISTILBERT TRAINING COMPLETE!')
print('=' * 80)
print(f'\nFinal Accuracy: {accuracy*100:.2f}%')
print('Next: Run python scripts/test_ensemble.py')
