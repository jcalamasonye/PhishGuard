import pandas as pd
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

print('PHISHGUARD AI - DISTILBERT FAST TRAINING')
print('Using smaller dataset for speed')
print('=' * 80)

# Load SMALL sample
df = pd.read_csv('data/processed/final_training_data.csv')
df_small = df.sample(n=2000, random_state=42)  # Just 2000 emails!

print(f'Training on {len(df_small):,} emails (faster!)')

X_train, X_test, y_train, y_test = train_test_split(
    df_small['email_text'].values,
    df_small['label'].values,
    test_size=0.2,
    random_state=42,
    stratify=df_small['label']
)

print(f'Train: {len(X_train):,} | Test: {len(X_test):,}')

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
train_encodings = tokenizer(list(X_train), truncation=True, padding=True, max_length=128)  # Shorter!
test_encodings = tokenizer(list(X_test), truncation=True, padding=True, max_length=128)

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

model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=2)

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {'accuracy': accuracy_score(labels, predictions)}

training_args = TrainingArguments(
    output_dir='./distilbert_results',
    num_train_epochs=2,  # Fewer epochs
    per_device_train_batch_size=16,  # Bigger batches
    per_device_eval_batch_size=32,
    warmup_steps=100,
    weight_decay=0.01,
    logging_steps=50,
    eval_strategy='epoch',
    save_strategy='epoch',
    load_best_model_at_end=True,
    metric_for_best_model='accuracy'
)

print('\nTraining (5-10 minutes)...\n')
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics
)

trainer.train()

results = trainer.evaluate()
accuracy = results.get('eval_accuracy', results.get('accuracy', 0))

print(f'\nAccuracy: {accuracy*100:.2f}%')

model.save_pretrained('models/distilbert')
tokenizer.save_pretrained('models/distilbert')

print('Saved models/distilbert/')
print('DONE! Now test with: python scripts/test_ensemble.py')
