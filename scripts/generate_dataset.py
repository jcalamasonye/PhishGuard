import pandas as pd
import numpy as np
import random

print('=' * 80)
print('PHISHGUARD AI - PERFECT DATASET GENERATOR')
print('Creating realistic, targeted training data')
print('=' * 80)

np.random.seed(42)
random.seed(42)

all_emails = []

# ============================================================================
# PHISHING EMAILS - 8,000 TOTAL
# ============================================================================
print('\n[1] Generating phishing emails...\n')

# 1. ACCOUNT SUSPENSION PHISHING (2,000)
print('  Creating account suspension phishing...')
brands = ['PayPal', 'Amazon', 'Netflix', 'Microsoft', 'Apple', 'Google', 'Facebook', 'Instagram', 'LinkedIn', 'Dropbox']
fake_urls = {
    'PayPal': ['paypa1.com', 'paypal-secure.com', 'paypal-verify.net'],
    'Amazon': ['amaz0n.com', 'amazon-security.com', 'amazon-verify.net'],
    'Netflix': ['netfl1x.com', 'netflix-billing.com', 'netflix-account.net'],
    'Microsoft': ['micros0ft.com', 'microsoft-support.com', 'office365-verify.net'],
    'Apple': ['app1e.com', 'apple-security.com', 'icloud-verify.net'],
    'Google': ['g00gle.com', 'google-security.com', 'gmail-verify.net'],
    'Facebook': ['facebo0k.com', 'facebook-security.com'],
    'Instagram': ['1nstagram.com', 'instagram-verify.net'],
    'LinkedIn': ['linked1n.com', 'linkedin-security.com'],
    'Dropbox': ['dr0pbox.com', 'dropbox-storage.net']
}

subjects = [
    'URGENT: Your {brand} account has been suspended',
    'Security Alert: {brand} account requires verification',
    'Action Required: {brand} account will be closed',
    '{brand} Security: Unusual activity detected',
    'Your {brand} account has been limited',
    'Final Notice: {brand} account suspension',
]

bodies = [
    'We detected suspicious activity on your {brand} account. Click here to verify: http://{url}',
    'Your account has been temporarily suspended. Restore access immediately at http://{url}',
    'Unusual login detected from {location}. Verify your identity: http://{url}',
    'Your account will be permanently deleted within 24 hours unless you confirm at http://{url}',
    'We have limited your account access. Verify ownership immediately: http://{url}',
    'Security breach detected. Update your credentials at http://{url} to prevent account closure',
]

locations = ['Russia', 'China', 'Nigeria', 'Ukraine', 'Brazil', 'Unknown Location']

for _ in range(2000):
    brand = random.choice(brands)
    subject = random.choice(subjects).format(brand=brand)
    body = random.choice(bodies).format(
        brand=brand,
        url=random.choice(fake_urls[brand]),
        location=random.choice(locations)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'account_suspension'
    })

# 2. PRIZE/LOTTERY SCAMS (1,500)
print('  Creating prize/lottery scams...')
prize_subjects = [
    'CONGRATULATIONS! You won ${amount}',
    'You are our lucky winner!',
    'Claim your ${amount} prize now',
    'WINNER NOTIFICATION: ${amount}',
    'You have won the lottery - ${amount}',
]

prize_bodies = [
    'You have won ${amount} in our annual customer lottery. Send your details to claim: {info}',
    'Congratulations! You are one of 10 winners of ${amount}. Reply with your bank details.',
    'You have been selected to receive ${amount}. Provide: full name, address, bank account number.',
    'URGENT: Your ${amount} prize expires in 48 hours. Send ID and bank info to claim.',
    'You won ${amount}! To claim, reply with: SSN, date of birth, and account number.',
]

amounts = ['1000000', '500000', '250000', '100000', '50000', '25000']
info_requests = ['full name, address, bank account', 'SSN and bank details', 'copy of ID and account number']

for _ in range(1500):
    amount = random.choice(amounts)
    subject = random.choice(prize_subjects).format(amount=amount)
    body = random.choice(prize_bodies).format(
        amount=amount,
        info=random.choice(info_requests)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'prize_scam'
    })

# 3. DELIVERY SCAMS (1,500)
print('  Creating delivery scams...')
carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Delivery']
fake_tracking = {
    'FedEx': ['fedx-track.net', 'fedex-delivery.com', 'fedx-redelivery.net'],
    'UPS': ['ups-delivery.info', 'ups-tracking.net', 'ups-redelivery.com'],
    'DHL': ['dh1-package.com', 'dhl-delivery.net', 'dhl-track.info'],
    'USPS': ['usps-redelivery.net', 'usps-tracking.com', 'usps-delivery.info'],
    'Amazon Delivery': ['amazon-logistics.net', 'amzn-delivery.com']
}

delivery_subjects = [
    '{carrier}: Delivery attempt failed',
    '{carrier} notification: Action required',
    'Your {carrier} package is waiting',
    '{carrier}: Package delivery unsuccessful',
]

delivery_bodies = [
    'We attempted delivery but no one was home. Reschedule at http://{url}',
    'Your package requires additional information. Track at http://{url}',
    'Customs fee of ${fee} required for delivery. Pay at http://{url}',
    'Package will be returned unless you confirm delivery at http://{url}',
    'Failed delivery attempt. Click here to reschedule: http://{url}',
]

fees = ['3.99', '5.99', '2.50', '4.50', '7.99']

for _ in range(1500):
    carrier = random.choice(carriers)
    subject = random.choice(delivery_subjects).format(carrier=carrier)
    body = random.choice(delivery_bodies).format(
        url=random.choice(fake_tracking[carrier]),
        fee=random.choice(fees)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'delivery_scam'
    })

# 4. TAX/GOVERNMENT SCAMS (1,500)
print('  Creating tax/government scams...')
gov_subjects = [
    'IRS: Tax refund notification',
    'Government refund of ${amount} approved',
    'Social Security Administration: Action required',
    'IRS: Final notice - Tax refund pending',
    'Treasury Department: Refund notification',
]

gov_bodies = [
    'You are eligible for a tax refund of ${amount}. Verify details at http://{url}',
    'Your federal refund of ${amount} is ready. Claim at http://{url}',
    'Final notice: Unclaimed refund of ${amount}. Process at http://{url}',
    'Social Security benefits update required. Verify at http://{url} or benefits will stop.',
    'IRS refund of ${amount} pending. Provide bank details to receive.',
]

refund_amounts = ['1247.32', '2156.89', '843.50', '3421.18', '987.65', '1532.44']
fake_gov_urls = ['irs-refund.com', 'tax-claim.net', 'ssa-verify.org', 'treasury-refund.info', 'gov-refunds.net']

for _ in range(1500):
    amount = random.choice(refund_amounts)
    subject = random.choice(gov_subjects).format(amount=amount)
    body = random.choice(gov_bodies).format(
        amount=amount,
        url=random.choice(fake_gov_urls)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'government_scam'
    })

# 5. CEO FRAUD / BEC (1,000)
print('  Creating CEO fraud / BEC emails...')
bec_subjects = [
    'Urgent: Wire transfer needed',
    'Quick question',
    'Need your help ASAP',
    'Time sensitive request',
    'Confidential - urgent payment',
]

bec_bodies = [
    'I need you to process an urgent wire transfer of ${amount}. Will explain later. Time sensitive.',
    'Please send ${amount} to this account: {account}. Confidential vendor payment.',
    'In a meeting, need you to handle this payment urgently: ${amount}. Details: {account}',
    'Urgent vendor payment of ${amount} needed today. Wire to {account}. Will explain offline.',
    'Can you handle a wire transfer? ${amount} to {account}. Very urgent, client waiting.',
]

wire_amounts = ['15000', '25000', '50000', '10000', '35000', '75000', '20000']
accounts = [
    'Account: 9876543210, Routing: 021000021',
    'Swift: ABCD1234, Account: 5555123456',
    'ACH: 123456789, Account: 9988776655',
    'Wire details: 0123456789 / 111000025'
]

for _ in range(1000):
    subject = random.choice(bec_subjects)
    amount = random.choice(wire_amounts)
    body = random.choice(bec_bodies).format(
        amount=amount,
        account=random.choice(accounts)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'ceo_fraud'
    })

# 6. PASSWORD RESET PHISHING (500)
print('  Creating password reset phishing...')
reset_subjects = [
    'Your password will expire soon',
    'Password reset required',
    'Security update: Change your password',
    'Your password has expired',
]

reset_bodies = [
    'Your password will expire in 24 hours. Reset at http://{url}',
    'For security, please update your password: http://{url}',
    'Password expired. Click here to create new one: http://{url}',
    'System upgrade requires password reset: http://{url}',
]

reset_urls = ['password-reset.com', 'account-security.net', 'reset-password.info']

for _ in range(500):
    subject = random.choice(reset_subjects)
    body = random.choice(reset_bodies).format(url=random.choice(reset_urls))
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 1,
        'category': 'password_reset'
    })

print(f'  Created {len([e for e in all_emails if e["label"] == 1])} phishing emails')

# ============================================================================
# LEGITIMATE EMAILS - 8,000 TOTAL
# ============================================================================
print('\n[2] Generating legitimate emails...\n')

# 1. WORK EMAILS (2,500)
print('  Creating work emails...')
work_subjects = [
    'Team meeting scheduled for {day}',
    'Project update: {project}',
    'Weekly status report',
    '{project} milestone completed',
    'Action items from today meeting',
    'Q{quarter} planning session',
    'Feedback request: {project}',
]

work_bodies = [
    'Hi team, our meeting is scheduled for {day} at {time} in {room}.',
    'Here is the update on {project}. All tasks are on track. Next milestone due {day}.',
    'Attached is this week status report. Please review before Friday meeting.',
    'Great news! We completed the {project} milestone ahead of schedule.',
    'Following up on action items from today. Please update your tasks by {day}.',
    'Q{quarter} planning session scheduled for {day}. Come prepared with your goals.',
    'Could you review the {project} document and provide feedback by {day}?',
]

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'next week', 'tomorrow']
times = ['10 AM', '2 PM', '3 PM', '11 AM', '4 PM', '9 AM']
rooms = ['conference room A', 'conference room B', 'the main hall', 'room 301', 'Zoom']
projects = ['website redesign', 'Q2 campaign', 'product launch', 'mobile app', 'client presentation']
quarters = ['1', '2', '3', '4']

for _ in range(2500):
    subject = random.choice(work_subjects).format(
        day=random.choice(days),
        project=random.choice(projects),
        quarter=random.choice(quarters)
    )
    body = random.choice(work_bodies).format(
        day=random.choice(days),
        time=random.choice(times),
        room=random.choice(rooms),
        project=random.choice(projects),
        quarter=random.choice(quarters)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 0,
        'category': 'work'
    })

# 2. E-COMMERCE (2,000)
print('  Creating e-commerce emails...')
ecom_subjects = [
    'Your order #{order} has shipped',
    'Order confirmation #{order}',
    'Thank you for your purchase',
    'Delivery update for order #{order}',
    'Your order is ready for pickup',
]

ecom_bodies = [
    'Your order #{order} has been shipped and will arrive by {day}. Track at www.yourstore.com/tracking',
    'Thank you for your order #{order}. Total: ${amount}. Expected delivery: {day}.',
    'We have received your order and are processing it. You will receive a shipping notification soon.',
    'Your order #{order} is out for delivery and will arrive today between {time}.',
    'Order #{order} is ready for pickup at our {location} location. Bring your ID.',
]

orders = ['54321', '98765', '13579', '24680', '11111', '99999', '77777']
amounts = ['29.99', '49.99', '99.99', '19.99', '39.99', '79.99', '149.99']
locations = ['downtown', 'mall', 'main street', 'plaza', 'central']

for _ in range(2000):
    order = random.choice(orders)
    subject = random.choice(ecom_subjects).format(order=order)
    body = random.choice(ecom_bodies).format(
        order=order,
        amount=random.choice(amounts),
        day=random.choice(days),
        time=random.choice(times),
        location=random.choice(locations)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 0,
        'category': 'ecommerce'
    })

# 3. MARKETING / SAAS (2,000) - INCLUDING SANITY-LIKE EMAILS
print('  Creating marketing/SaaS emails...')
saas_subjects = [
    'Welcome to {service}',
    '{service} - New features available',
    'Your {service} free trial is ready',
    '{service} monthly update',
    'Tips for getting started with {service}',
    'We have unlocked premium features for you',
]

saas_bodies = [
    'Welcome to {service}! We are excited to have you. Get started at www.{service}.com',
    'Check out our new features: {feature1}, {feature2}, and {feature3}. Learn more in your dashboard.',
    'Good news! We have unlocked a free 30-day trial of our premium plan for you. No credit card required.',
    'Here is your monthly {service} update with tips, new features, and community highlights.',
    'Getting started with {service} is easy. Check out our tutorials at www.{service}.com/help',
    'We have upgraded your account with premium features for 30 days. Enjoy enhanced {feature1} and {feature2}!',
]

services = ['CloudApp', 'DataSync', 'TeamWork', 'ContentHub', 'DevTools', 'ProjectPro', 'Sanity CMS']
features = [
    ['private datasets', 'advanced analytics', 'team collaboration'],
    ['scheduled publishing', 'AI assist', 'user roles'],
    ['real-time sync', 'version control', 'custom workflows'],
    ['API access', 'webhooks', 'integrations']
]

for _ in range(2000):
    service = random.choice(services)
    feature_set = random.choice(features)
    subject = random.choice(saas_subjects).format(service=service)
    body = random.choice(saas_bodies).format(
        service=service,
        feature1=feature_set[0],
        feature2=feature_set[1],
        feature3=feature_set[2] if len(feature_set) > 2 else ''
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 0,
        'category': 'marketing'
    })

# 4. PERSONAL (1,500)
print('  Creating personal emails...')
personal_subjects = [
    'Appointment reminder',
    'Your bill is ready',
    'Subscription renewal notice',
    'Password changed successfully',
    'Receipt for your payment',
]

personal_bodies = [
    'Reminder: You have an appointment on {day} at {time}. Reply to confirm or reschedule.',
    'Your monthly bill of ${amount} is ready. View at www.provider.com/billing',
    'Your annual subscription will renew on {day}. Manage preferences in your account settings.',
    'Your password was successfully changed on {day}. If this was not you, contact support immediately.',
    'Thank you for your payment of ${amount}. Receipt attached. Transaction ID: {order}',
]

for _ in range(1500):
    subject = random.choice(personal_subjects)
    body = random.choice(personal_bodies).format(
        day=random.choice(days),
        time=random.choice(times),
        amount=random.choice(amounts),
        order=random.choice(orders)
    )
    all_emails.append({
        'email_text': f'{subject} {body}',
        'label': 0,
        'category': 'personal'
    })

print(f'  Created {len([e for e in all_emails if e["label"] == 0])} legitimate emails')

# ============================================================================
# SAVE DATASET
# ============================================================================
print(f'\n[3] Finalizing dataset...\n')

df = pd.DataFrame(all_emails)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

phishing_count = sum(df.label == 1)
safe_count = sum(df.label == 0)

print(f'  Total emails: {len(df):,}')
print(f'  Phishing: {phishing_count:,} ({phishing_count/len(df)*100:.1f}%)')
print(f'  Legitimate: {safe_count:,} ({safe_count/len(df)*100:.1f}%)')

# Save
df[['email_text', 'label']].to_csv('perfect_phishing_dataset.csv', index=False)

print(f'\n  Saved: perfect_phishing_dataset.csv')

# Category breakdown
print(f'\n  Phishing breakdown:')
for cat in df[df.label == 1]['category'].value_counts().items():
    print(f'    {cat[0]}: {cat[1]:,}')

print(f'\n  Legitimate breakdown:')
for cat in df[df.label == 0]['category'].value_counts().items():
    print(f'    {cat[0]}: {cat[1]:,}')

print('\n' + '=' * 80)
print(' PERFECT DATASET COMPLETE!')
print('=' * 80)
print('\nThis dataset contains:')
print('- Realistic phishing patterns (URLs, urgency, threats)')
print('- Diverse legitimate emails (work, shopping, SaaS, personal)')
print('- Balanced classes for fair training')
print('- NO spam contamination')
print('\nNext: Combine with Enron emails for even more legitimate examples!')
