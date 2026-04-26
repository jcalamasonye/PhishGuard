import pandas as pd
import numpy as np
import random
import re

random.seed(42)
np.random.seed(42)

print("Generating world-class phishing detection dataset...")
print("=" * 70)

# ============================================================
# PHISHING EMAILS — Every category ever documented
# ============================================================

PHISHING_EMAILS = []

# ── 1. CREDENTIAL HARVESTING ─────────────────────────────────
PHISHING_EMAILS += [
    # Microsoft / Office 365
    f"""From: Microsoft Account Team <security-noreply@microsoft-account-alert.com>
To: {name}
Subject: {subj}

Dear {name},

{body}

Your Microsoft account will be locked in {hours} hours if you do not verify immediately.

Account: {email}
Verification required by: {deadline}

[Verify Account Now]({url})

Microsoft Account Security Team
Microsoft Corporation | One Microsoft Way | Redmond, WA 98052

This is an automated message. Do not reply to this email.
To stop receiving these emails, click unsubscribe."""
    for name, subj, body, hours, email, deadline, url in [
        ("John Smith", "Action Required: Your Microsoft Account Will Be Locked",
         "We detected unusual sign-in activity on your Microsoft account from an unrecognized device in Lagos, Nigeria at 3:47 AM UTC. If this was not you, your account may be compromised.",
         "24", "john.smith@company.com", "April 25, 2026 at 11:59 PM UTC",
         "http://microsoft-account-verify.suspicious-domain.com/secure/login"),
        ("Sarah Johnson", "URGENT: Verify Your Office 365 Account",
         "Your Office 365 subscription payment has failed. To avoid losing access to your emails, OneDrive, and Teams, please update your payment information immediately.",
         "48", "sjohnson@work.org", "April 26, 2026",
         "http://office365-billing-update.net/payment/verify"),
        ("Michael Chen", "Your Password Expires Today - Action Required",
         "According to our records, your Microsoft 365 password will expire in 2 hours. Failure to update your password will result in immediate account suspension and loss of access to all Microsoft services.",
         "2", "m.chen@enterprise.com", "Today at 5:00 PM",
         "http://password-reset-microsoft.phishing-site.ru/update"),
    ]
] + [
    # Google / Gmail
    """From: Google Security <no-reply@google-security-alert.com>
To: user@gmail.com
Subject: Critical Security Alert - Immediate Action Required

Google Security Alert

We detected a sign-in attempt to your Google Account from:
Location: Bucharest, Romania
Device: Windows PC
Time: Wednesday, April 24, 2026, 2:13 AM

If this was you, you can safely ignore this message.

If this was NOT you, your account may be compromised. Click below immediately to secure your account:

[Secure My Account Now](http://google-security-verify.malicious-domain.com/secure)

After clicking, you will be asked to verify your identity with your password and phone number.

You received this email because unusual activity was detected on your account.
Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043""",

    """From: Google Drive <drive-noreply@google-drive-storage.net>
To: victim@email.com  
Subject: Your Google Drive storage is full - Upgrade now

Hello,

Your Google Drive storage (15 GB) is 100% full.

This means:
- You cannot receive new emails in Gmail
- Google Photos backup has stopped
- You cannot save new files to Drive

Upgrade your storage plan to avoid losing important files:

[Get 100GB for just $0.99/month](http://googledrive-upgrade-offer.phishingsite.com/plans)

IMPORTANT: If you do not upgrade within 24 hours, Google may begin deleting your oldest files.

The Google One Team""",
]

# ── 2. CEO / EXECUTIVE FRAUD (BEC) ───────────────────────────
PHISHING_EMAILS += [
    """From: James Richardson <j.richardson@yourcompany-ceo.net>
To: finance@targetcompany.com
Subject: Confidential - Urgent Wire Transfer Needed Today

Hi Sarah,

I need your help with something extremely time-sensitive and confidential. I'm currently in a board meeting discussing a sensitive acquisition and cannot speak by phone right now.

We need to process a wire transfer today as part of the closing. This is under strict NDA so please do not discuss with anyone else at the company until the announcement tomorrow.

Details:
Amount: $47,250 USD
Beneficiary: Meridian Capital Partners LLC  
Bank: JP Morgan Chase
Account: 8472910364
Routing: 021000021
Reference: ACQ-2024-MCP

Please process before 3:00 PM today. Legal will send documentation within 30 minutes. Please confirm by email once complete.

I appreciate your urgency and discretion on this.

Best,
James Richardson
Chief Executive Officer
Sent from iPhone""",

    """From: Dr. Amanda Foster - CEO <a.foster@companycorp-global.net>
To: accountspayable@victim.com
Subject: Re: Invoice Payment - URGENT

Hi,

Following up on the invoice we discussed. Our new vendor requires payment by end of business today or we lose the contract worth 2.3M.

Please process payment to:
Bank: Wells Fargo
Account Name: Global Tech Solutions LLC
Account Number: 4829103847
Routing: 121000248
Amount: $89,500

This is extremely time sensitive. Please do not use our normal payment approval process as the CFO is traveling internationally with no phone access.

Confirm when done. I owe you one!

Amanda
CEO""",

    """From: Robert Williams <rwilliams@company-executives.com>
To: hr@targetcompany.org
Subject: Confidential: Employee Payroll Update Required

Hello,

This is Robert Williams, VP of Human Resources. I need you to update the direct deposit information for my paycheck immediately. I recently changed banks and need this reflected in the next payroll run which is Friday.

New banking details:
Bank: Bank of America
Account Number: 2938471029
Routing Number: 026009593

Please confirm the update has been made. Due to the sensitive nature of payroll information, please handle this directly and do not loop in other team members.

Thank you,
Robert Williams
VP Human Resources""",
]

# ── 3. FINANCIAL / BANKING FRAUD ─────────────────────────────
PHISHING_EMAILS += [
    """From: Chase Bank Security <security@chase-account-alerts.com>
To: customer@email.com
Subject: URGENT: Suspicious Transaction Detected - Account Temporarily Limited

Dear Chase Customer,

Our fraud detection system has identified suspicious activity on your Chase checking account ending in 4821.

SUSPICIOUS TRANSACTION DETAILS:
Date: April 24, 2026
Merchant: Electronics International Purchase  
Amount: $1,247.83 USD
Location: Lagos, Nigeria
Status: PENDING

Your account has been TEMPORARILY LIMITED to protect your funds. You will NOT be able to:
- Make purchases or withdrawals
- Access online banking
- Use your debit card

IMMEDIATE ACTION REQUIRED:
You must verify your identity within 2 hours to restore full account access. Failure to verify will result in a permanent account hold.

[Verify My Identity Now](http://chase-fraud-verify.suspicious-url.com/secure)

Chase Fraud Protection Team
JPMorgan Chase Bank, N.A.""",

    """From: Wells Fargo Alert <alerts@wellsfargo-security-center.com>
To: accountholder@email.com
Subject: Your Wells Fargo Account Has Been Suspended

WELLS FARGO BANK
IMPORTANT SECURITY NOTICE

Dear Valued Customer,

We have temporarily suspended your Wells Fargo Online Banking account due to multiple failed login attempts detected from an unrecognized location.

To restore access to your account, you must complete identity verification within 24 hours:

1. Click the secure link below
2. Enter your account credentials
3. Verify with your Social Security Number (last 4 digits)
4. Confirm your debit card details

[Restore Account Access](http://wellsfargo-account-restore.malware-domain.net)

If you do not verify within 24 hours, your account will be permanently suspended and funds may be frozen pending investigation.

Wells Fargo Security Team
1-800-869-3557 (This number will redirect to our phishing call center)""",

    """From: PayPal <service@paypal-security-center.net>
To: paypaluser@email.com  
Subject: Your PayPal Account Has Been Limited - Action Required

Dear PayPal Member,

We've noticed some unusual activity in your PayPal account, so we've limited what you can do with your account until you confirm your information.

Why is my account limited?

We detected that your account was used from a new device or location. For your security, we've placed a hold on all transactions.

What do I need to do?

Step 1: Log in to your account using the secure link below
Step 2: Confirm your personal information
Step 3: Verify your bank account or credit card
Step 4: Complete identity verification

[Log In to My PayPal Account](http://paypal-account-restore.phishing-domain.com/login)

You have 24 hours to complete these steps or your account will be permanently suspended.

PayPal Customer Service""",
]

# ── 4. PACKAGE / DELIVERY SCAMS ──────────────────────────────
PHISHING_EMAILS += [
    """From: FedEx Delivery <tracking@fedex-delivery-notification.net>
To: recipient@email.com
Subject: FedEx: Package Delivery Failed - Action Required

FedEx Express

DELIVERY NOTIFICATION

Dear Customer,

We attempted to deliver your package today but were unable to complete delivery because nobody was available at the delivery address.

Package Details:
Tracking Number: 7489-2847-9012-3847
Sender: Online Store
Estimated Weight: 2.3 lbs
Delivery Attempt: April 24, 2026 at 10:42 AM

Your package is currently being held at our facility. To arrange redelivery, a small redelivery processing fee of $1.99 is required.

[Schedule Redelivery - $1.99](http://fedex-redelivery-payment.scam-domain.com/pay)

Please note: If redelivery is not arranged within 5 business days, your package will be returned to the sender and you may be charged a return shipping fee.

FedEx Customer Service Team""",

    """From: UPS Delivery Notification <noreply@ups-tracking-notification.com>
To: customer@email.com
Subject: UPS Shipment Notification: Package On Hold

UPS

IMPORTANT SHIPMENT NOTIFICATION

A package addressed to you is currently on hold at a UPS facility pending customs clearance and payment of import duties.

Shipment Details:
UPS Tracking ID: 1Z999AA10123456784
Origin: Shanghai, China
Description: Personal Package
Customs Duty Amount: $3.47 USD

To release your package, you must pay the customs duty fee online:

[Pay Customs Fee - $3.47](http://ups-customs-payment.fraudulent-site.com/pay)

Package will be returned to sender after 7 days if customs fee is not paid.

UPS Import Control
United Parcel Service""",

    """From: Amazon <order-update@amazon-delivery-status.net>
To: customer@email.com
Subject: Problem with your Amazon delivery - Verify your address

Dear Amazon Customer,

We encountered a problem delivering your recent Amazon order (#113-8394729-4827563).

The delivery driver was unable to locate your address due to incomplete information in our system.

To ensure successful delivery, please verify your delivery address and payment information:

[Verify Delivery Information](http://amazon-address-verify.phishing-page.com/update)

If your address is not verified within 24 hours, your order will be automatically cancelled and a refund may take 5-10 business days to process.

Amazon Customer Service
amazon.com""",
]

# ── 5. HR / PAYROLL SCAMS ─────────────────────────────────────
PHISHING_EMAILS += [
    """From: HR Department <hr.benefits@company-hr-portal.net>
To: employee@company.com
Subject: FINAL REMINDER: Open Enrollment Closes Tomorrow at 5PM

Dear Valued Employee,

This is your FINAL REMINDER that the Annual Benefits Open Enrollment period closes TOMORROW at 5:00 PM Eastern Time.

Employees who fail to complete enrollment will be automatically enrolled in the most expensive plan option and will NOT be eligible to make changes until next year's open enrollment.

Changes effective January 1st include:
• Medical: New deductible structure - up to 23% higher costs for default enrollees
• Dental: Coverage changes for major procedures
• Vision: New provider network
• 401(k): Auto-enrollment changes

To complete your enrollment, you must verify your identity:

[Complete Benefits Enrollment](http://company-hr-benefits-portal.phishing.com/enroll)

You will need your:
- Employee ID
- Social Security Number (last 4 digits)  
- Current bank account information for FSA/HSA setup

HR Benefits Administration
Human Resources Department""",

    """From: Payroll Services <payroll@company-payroll-update.net>
To: all-staff@targetcompany.com
Subject: URGENT: Direct Deposit Information Must Be Updated By Friday

Dear Employee,

Our payroll system is migrating to a new banking partner. ALL employees must re-verify their direct deposit information by this Friday at noon or payroll will be delayed.

This affects your paycheck scheduled for next week.

To update your banking information securely:

[Update Direct Deposit Now](http://payroll-direct-deposit-update.scam.com/verify)

You will need:
- Your employee ID
- Current bank routing number
- Bank account number  
- Last 4 digits of your Social Security Number

This is MANDATORY. Employees who do not complete this process by Friday will experience a payroll delay of 1-2 pay periods.

Payroll Services Department""",
]

# ── 6. IT / TECHNICAL SCAMS ──────────────────────────────────
PHISHING_EMAILS += [
    """From: IT Security Team <itsecurity@company-it-helpdesk.net>
To: employee@company.com
Subject: MANDATORY: Multi-Factor Authentication Enrollment Required Today

Dear Employee,

As part of our company-wide security initiative, ALL employees are required to enroll in our new Multi-Factor Authentication (MFA) system by end of day TODAY.

Employees who do not complete MFA enrollment by 5:00 PM will have their network access suspended until enrollment is complete. This includes:
- Email access
- VPN access
- Internal systems
- Remote desktop

Complete MFA Enrollment:

[Enroll in MFA Now](http://company-mfa-enrollment.phishing.net/enroll)

You will be asked to:
1. Verify your current username and password
2. Register your mobile phone number
3. Set up backup authentication codes

This is not optional. Network access will be suspended for all non-compliant accounts at 5:01 PM today.

IT Security Operations
Help Desk: ext. 4357""",

    """From: Microsoft IT Support <support@microsoft-technical-support-center.com>
To: user@company.com
Subject: Your Computer Has Been Infected - Immediate Action Required

MICROSOFT SECURITY CENTER

CRITICAL ALERT

Our security systems have detected that your computer is infected with a dangerous virus that is:
- Sending your passwords to hackers
- Accessing your banking information
- Recording your keystrokes
- Transmitting your personal files

DO NOT ignore this warning. Your computer and personal data are at immediate risk.

CALL MICROSOFT SUPPORT IMMEDIATELY:
1-888-555-0147 (Toll-Free - Available 24/7)

Our certified technicians will:
1. Remove the virus remotely
2. Secure your personal information
3. Install advanced protection

Your computer's unique infection ID: MS-VIRUS-827491-X

Do not shut down your computer as this may cause data loss.

Microsoft Security Center
Windows Defender Team""",
]

# ── 7. SOCIAL MEDIA PHISHING ─────────────────────────────────
PHISHING_EMAILS += [
    """From: LinkedIn <notifications@linkedin-security-alert.com>
To: professional@email.com
Subject: Your LinkedIn profile appeared in 47 recruiter searches this week

LinkedIn

Hi [Name],

Your profile has been getting noticed! Here's your weekly activity summary:

Profile views: 23
Search appearances: 47
Post impressions: 1,204
Connection requests: 5 pending

Two Fortune 500 recruiters viewed your full profile this week. Your current role is matching active searches.

However, your account requires verification to continue showing in recruiter search results. Unverified accounts are being removed from search results on May 1st.

[Verify Your Account to Stay Visible](http://linkedin-account-verify.phishing-domain.com/verify)

This verification link expires in 24 hours.

LinkedIn Security Team""",

    """From: Facebook Security <security@facebook-account-alert.net>
To: user@email.com
Subject: Your Facebook Account Will Be Disabled - Final Warning

Facebook

FINAL WARNING

Your Facebook account has been reported for violating our Community Standards and will be permanently DISABLED within 24 hours unless you appeal this decision.

Reported violations:
- Posting misleading information
- Suspected fake account activity
- Multiple spam reports from other users

To appeal and prevent account deletion:

[Appeal Account Disablement](http://facebook-account-appeal.malicious-domain.com/appeal)

If you do not appeal within 24 hours, your account will be permanently deleted along with all your photos, videos, messages, and memories.

Facebook Security Team
Meta Platforms Inc.""",
]

# ── 8. TAX / GOVERNMENT SCAMS ────────────────────────────────
PHISHING_EMAILS += [
    """From: Internal Revenue Service <irs-refund@irs-tax-refund-center.com>
To: taxpayer@email.com
Subject: IRS TAX REFUND NOTIFICATION - $2,847.00 Pending

INTERNAL REVENUE SERVICE
DEPARTMENT OF THE TREASURY

OFFICIAL TAX REFUND NOTIFICATION

Dear Taxpayer,

After reviewing your tax return, the Internal Revenue Service has determined that you are entitled to a tax refund of $2,847.00 for the tax year 2025.

To receive your refund, you must verify your identity and banking information:

[Claim Your Tax Refund](http://irs-tax-refund-claim.fraudulent.com/claim)

You will need to provide:
- Social Security Number
- Bank account and routing number
- Date of birth
- Current address

IMPORTANT: This refund offer expires in 72 hours. Unclaimed refunds are returned to the U.S. Treasury.

IRS Refund Processing Center
Internal Revenue Service
Washington, D.C. 20224""",

    """From: Social Security Administration <benefits@ssa-benefits-alert.net>
To: recipient@email.com
Subject: URGENT: Your Social Security Benefits Are Being Suspended

SOCIAL SECURITY ADMINISTRATION
OFFICIAL NOTICE

URGENT NOTICE: BENEFIT SUSPENSION

Your Social Security benefits are scheduled to be SUSPENDED due to suspicious activity detected on your account.

Reason for Suspension:
- Multiple failed login attempts from different countries
- Possible fraudulent use of your Social Security Number
- Unverified bank account information

To prevent suspension of your monthly benefits ($1,847.00), you must verify your information immediately:

[Verify SSA Account Now](http://socialsecurity-verify.scam-domain.com/verify)

FAILURE TO VERIFY within 24 hours will result in:
- Immediate suspension of monthly payments
- Criminal investigation referral
- Potential prosecution for benefits fraud

Social Security Administration
Office of Inspector General""",
]

# ── 9. ROMANCE / ADVANCE FEE FRAUD ───────────────────────────
PHISHING_EMAILS += [
    """From: Mrs. Elizabeth Thompson <elizabeth.thompson.widow@gmail-secure.net>
To: recipient@email.com
Subject: Urgent Business Proposal - Strictly Confidential

Dear Friend,

I am Mrs. Elizabeth Thompson, widow of late Dr. James Thompson who was a successful businessman and petroleum contractor in Texas. I got your contact through a business directory and I am contacting you because I need a trusted person.

Before my husband passed away from cancer last month, he deposited the sum of $15.7 Million USD with a security company in London as a consignment. I need your assistance to claim and transfer this money to your country for safekeeping as I am very sick and cannot travel.

For your assistance, I am willing to offer you 30% of the total funds ($4.71 Million USD).

Please respond with:
- Your full name
- Your telephone number
- Your bank account details
- Copy of your ID

God bless you.

Mrs. Elizabeth Thompson
Contact: +44-7911-234567""",

    """From: Captain David Miller <david.miller.usarmy@secure-mail.net>
To: recipient@email.com
Subject: Help Needed - Classified Military Funds

Hello,

My name is Captain David Miller of the US Army stationed in Afghanistan. I am contacting you regarding a very sensitive and confidential matter.

During a military operation, we discovered $28.5 Million USD in cash hidden by ISIS militants. My commanding officer and I have decided to move this money out of the country and need a trusted civilian partner in your country to receive and secure the funds.

For your assistance, you will receive 40% ($11.4 Million USD).

This is 100% risk-free as I have all required military documentation. All I need from you is:
1. Your full name and address
2. Bank account details for transfer
3. A commitment fee of $500 to process military paperwork

Please treat this with utmost confidentiality.

Captain David Miller
US Army Special Forces""",
]

# ── 10. SUBSCRIPTION / BILLING SCAMS ─────────────────────────
PHISHING_EMAILS += [
    """From: Netflix Billing <billing@netflix-account-update.net>
To: subscriber@email.com
Subject: Your Netflix Account Payment Failed - Update Required

Netflix

PAYMENT FAILED

Hi [Member Name],

We were unable to process your monthly Netflix payment.

Your account will be suspended in 24 hours unless you update your payment information.

Failed payment details:
Amount: $15.99
Date: April 24, 2026
Reason: Card declined

[Update Payment Information](http://netflix-billing-update.phishing-site.com/payment)

If you do not update your payment information within 24 hours, your account will be suspended and you will lose access to all your shows, movies, and downloads.

Netflix Customer Service""",

    """From: Apple ID <no-reply@apple-id-billing.com>
To: iclouduser@email.com
Subject: Your Apple ID Has Been Disabled

Apple

Your Apple ID Has Been Disabled

Your Apple ID (user@icloud.com) has been disabled because your account information is out of date or appears to be invalid.

This affects access to:
- iCloud storage and backups
- App Store purchases
- Apple Music and Apple TV+
- Find My iPhone
- iMessages and FaceTime

To re-enable your account:

[Verify Apple ID](http://apple-id-verify-account.malicious.com/signin)

You have 48 hours to verify your account before your Apple ID is permanently disabled and all associated data is deleted.

Apple Support""",
]

# ── 11. COVID / HEALTH SCAMS ─────────────────────────────────
PHISHING_EMAILS += [
    """From: World Health Organization <who-alert@health-organization-alert.net>
To: recipient@email.com
Subject: COVID-19 Compensation Fund - You Are Eligible for $2,500

WORLD HEALTH ORGANIZATION
COVID-19 COMPENSATION PROGRAM

Dear Beneficiary,

The World Health Organization in partnership with the United Nations Development Program has set up a COVID-19 Compensation Fund to help individuals who suffered financial losses during the pandemic.

Based on our records, you are eligible to receive a compensation payment of $2,500 USD.

To claim your compensation:

[Claim COVID Compensation](http://who-covid-compensation.fraudulent.com/claim)

You will need to provide:
- Full name and address
- Proof of income loss (or self-certification)
- Bank account for direct deposit
- Processing fee: $75 (refundable)

Deadline: April 30, 2026

WHO COVID-19 Response Team""",
]

# ── 12. LOTTERY / PRIZE SCAMS ────────────────────────────────
PHISHING_EMAILS += [
    """From: Coca-Cola Prize Department <prizes@cocacola-winners.net>
To: winner@email.com
Subject: CONGRATULATIONS! You Won $500,000 in Coca-Cola Promotion

COCA-COLA COMPANY
INTERNATIONAL PROMOTION DIVISION

CONGRATULATIONS!!!

We are delighted to inform you that your email address has been selected as the GRAND PRIZE WINNER in our International Online Promotion for the year 2026.

PRIZE: USD $500,000 (Five Hundred Thousand United States Dollars)
Ticket Number: CCA-2026-WIN-7829471
Reference Number: CCA/2026/WINNER

To claim your prize:
1. Reply with your Full Name, Address, Phone Number, Occupation, Age
2. Pay the release fee of $250 to activate your prize account
3. Provide your bank details for wire transfer

Contact our claims agent:
Mr. Robert Johnson
Email: claims@cocacola-prize-dept.com
Phone: +44-7700-900461

The Coca-Cola Prize Committee""",
]

# ── 13. SPEAR PHISHING (Personalized) ────────────────────────
PHISHING_EMAILS += [
    """From: Jennifer Walsh <j.walsh@companydomain-secure.net>
To: target@company.com
Subject: Quick question about your presentation yesterday

Hi [Name],

Great presentation at the all-hands yesterday! I had a question about the Q3 numbers you mentioned.

I tried to access the shared drive link you sent but it's asking me to log in again. Can you resend it or give me access directly?

Here's the link I was trying to access: 
[Company SharePoint - Q3 Financial Data](http://sharepoint-company-access.phishing.com/documents)

Also, Sarah mentioned you might be the right person to talk to about the budget approval for the new project. Can we grab 15 minutes this week?

Thanks!
Jennifer

Jennifer Walsh | Senior Business Analyst
Tel: +1 (555) 234-5678""",
]

# ── 14. TYPOSQUATTING / LOOKALIKE DOMAINS ────────────────────
PHISHING_EMAILS += [
    """From: Amazon Customer Service <customer-service@amaz0n-support.com>
To: customer@email.com
Subject: Your Amazon Prime membership will expire today

Hello,

Your Amazon Prime membership is set to expire today. To continue enjoying Prime benefits including free shipping, Prime Video, and Prime Music, please renew your membership now.

Current membership: Amazon Prime Annual
Expiration: April 24, 2026
Annual renewal: $139.00

[Renew Prime Membership](http://amaz0n-prime-renew.com/membership)

If you choose not to renew, you will lose access to all Prime benefits immediately including pending free shipping orders.

Amazon Prime Team
amaz0n.com""",

    """From: PayPal <noreply@paypa1.com>
To: paypaluser@email.com
Subject: Transaction Receipt - $749.99 sent to unknown recipient

PayPal

Transaction Notification

A payment of $749.99 was sent from your PayPal account.

Transaction Details:
Date: April 24, 2026 at 3:47 PM
Amount: $749.99 USD
Recipient: International Trading Co.
Reference: PAY-2026-389472

If you did NOT authorize this transaction:

[Dispute This Transaction Immediately](http://paypa1-dispute-center.com/dispute)

You have 24 hours to dispute this charge before it is processed and becomes irreversible.

PayPal Security""",
]

# ── 15. VISHING / SMS PHISHING FOLLOW-UP ─────────────────────
PHISHING_EMAILS += [
    """From: Bank Fraud Department <fraud@bankofamerica-fraud-alert.net>
To: customer@email.com
Subject: Following up on your fraud report - Case #847291

Dear Customer,

This email is a follow-up to the phone call you received from our fraud department regarding suspicious activity on your account.

As discussed with our agent (Agent ID: BOA-7291), your account has been flagged for the following suspicious transactions:

1. $2,400 - Cryptocurrency purchase - April 23
2. $1,800 - Wire transfer to international account - April 23
3. $950 - Gift card purchase - April 24

To complete the fraud investigation and restore your account, please click the secure link below and confirm your identity:

[Complete Fraud Verification](http://bankofamerica-fraud-verify.scam.com/verify)

Case Reference: BOA-FRAUD-847291

Bank of America Fraud Prevention""",
]

# ============================================================
# LEGITIMATE EMAILS — Every type of real email ever sent
# ============================================================

LEGITIMATE_EMAILS = []

# ── 1. PROFESSIONAL / BUSINESS ───────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Sarah Mitchell <sarah.mitchell@company.com>
To: team@company.com
Subject: Q3 Performance Review - Action Items

Hi everyone,

Following up from yesterday's Q3 performance review meeting. Here are the key action items we discussed:

1. Marketing team to finalize the campaign brief by April 30th
2. Engineering to complete the API integration by May 15th  
3. Sales to update CRM with new lead scoring criteria by end of week
4. Finance to prepare Q4 budget projections for the board meeting

Please reply to this email to confirm you've received your action items. If you have any questions or need clarification, don't hesitate to reach out.

The slides from the presentation are available in our shared Google Drive: /Company Files/Q3 Review/

Thanks everyone for a productive meeting!

Best regards,
Sarah Mitchell
VP of Operations
sarah.mitchell@company.com | +1 (555) 234-5678
Company Inc. | 123 Business Ave | New York, NY 10001""",

    """From: David Chen <d.chen@techcorp.io>
To: james.wilson@client.com
Subject: Re: Project Timeline Update - Phoenix Project

Hi James,

Thanks for the update. Looking at the revised timeline, I think we can make it work if we adjust a few dependencies.

A few thoughts:
- Moving the design review to April 28th gives us enough buffer before development starts
- We should loop in QA earlier than planned - suggest adding them to the kickoff on the 30th
- The staging environment will be ready by May 3rd as originally planned

I've updated the project plan in Jira and sent invites for the revised meetings. The new timeline shows us completing the beta release on May 20th, which actually works better for the client's announcement.

Let me know if you want to jump on a call this week to walk through the dependencies in more detail.

Best,
David

David Chen | Senior Project Manager
TechCorp | d.chen@techcorp.io | Mobile: +1 (555) 876-5432""",

    """From: Jennifer Hoffman <j.hoffman@lawfirm.com>
To: client@company.com
Subject: Contract Review Complete - Henderson Agreement

Dear Mr. Anderson,

I've completed my review of the Henderson Services Agreement and have a few items I'd like to discuss before you sign.

Summary of findings:
1. Section 4.2 (Liability Limitation) - The current cap of $50,000 is below industry standard. I'd recommend negotiating this to $500,000 or the value of the contract.
2. Section 7 (Termination) - The 90-day notice period is unusual for a service contract of this type. 30-60 days is more typical.
3. Section 12 (IP Ownership) - The language around "work for hire" needs clarification to protect your pre-existing IP.

I've attached a redlined version with my suggested changes. Please review at your convenience and let me know if you'd like to discuss before your Friday deadline.

Best regards,
Jennifer Hoffman, Esq.
Partner, Hoffman & Associates LLP
jennifer@lawfirm.com | (555) 345-6789""",
]

# ── 2. PRODUCT / SERVICE ONBOARDING ──────────────────────────
LEGITIMATE_EMAILS += [
    """From: Zeno Rocha <zeno.rocha@resend.com>
To: newuser@email.com
Subject: Welcome to Resend!

Hey,

My name is Zeno — I'm the founder and CEO of Resend.

We started Resend because we wanted a better email API for developers. A simple, fast, and elegant interface that just works.

Here are 3 tips to get started:

1. Send your first email
2. Add your domain
3. Check the docs

P.S.: Why did you sign up? What brought you here?

Hit "Reply" and let me know. I read and reply to every email.

Cheers,
Zeno

P.S. You can always reach me at zeno@resend.com""",

    """From: Slack <feedback@slack.com>
To: newuser@company.com
Subject: Welcome to Slack, [Name]! Here's how to get started

Hi [Name],

Welcome to Slack! You've joined the company workspace and you're all set to start collaborating with your team.

Here are a few things to help you get started:

📱 Download the mobile app
Stay connected on the go with Slack for iOS or Android.

💬 Find your teammates
Browse channels to find conversations relevant to your work. Start with #general and #random.

🔔 Set your notifications
Customize how and when you get notified so you can focus when you need to.

📚 Explore the Help Center
Got questions? Our Help Center has answers to common questions and tutorials.

If you need help getting started, reply to this email or visit slack.com/help.

Happy Slacking!
The Slack Team""",

    """From: GitHub <noreply@github.com>
To: developer@email.com
Subject: [GitHub] Your repository has been created

Hi there,

Your repository my-awesome-project has been created successfully.

Repository URL: https://github.com/yourusername/my-awesome-project

Quick setup:

# Create a new repository on the command line
echo "# my-awesome-project" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/yourusername/my-awesome-project.git
git push -u origin main

Happy coding!
The GitHub Team

You're receiving this email because you created a repository on GitHub.
Manage notification preferences at github.com/settings/notifications""",
]

# ── 3. TRANSACTIONAL / RECEIPTS ──────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Amazon <auto-confirm@amazon.com>
To: customer@email.com
Subject: Your Amazon.com order of "Sony WH-1000XM5 Wireless..." has shipped!

Hello Customer Name,

Your order has shipped!

Order #113-8492847-3829174
Estimated delivery: April 26-27, 2026

Items shipped:
1. Sony WH-1000XM5 Wireless Noise Canceling Headphones - $299.99

Shipping to:
John Smith
123 Main Street
New York, NY 10001

Shipped via UPS
Tracking number: 1Z999AA10123456784
Track your package: ups.com/track

Visit Your Orders to view the status of your order, make changes, return items, and do much more.

Thank you for shopping with us.

Amazon.com""",

    """From: Stripe <receipts@stripe.com>
To: merchant@business.com
Subject: Your receipt from Acme Corp

Your receipt from Acme Corp

Amount paid: $99.00
Date: April 24, 2026

Summary
Professional Plan (Monthly) - $99.00

Payment method: Visa ending in 4242
Receipt number: 2847-9012

This payment will appear on your statement as ACME CORP.

If you have any questions about this charge, please contact Acme Corp at billing@acmecorp.com

Powered by Stripe
stripe.com | privacy@stripe.com""",

    """From: Uber Receipts <uber.us@uber.com>
To: rider@email.com
Subject: Your Tuesday trip with Uber

Thanks for riding with us, [Name].

Here's your receipt for your trip on Tuesday, April 24, 2026.

Trip details:
Pickup: 123 Main St, New York, NY
Dropoff: JFK Airport Terminal 4
Distance: 18.3 miles
Duration: 42 minutes
Driver: Marcus R.

Fare breakdown:
Base fare: $2.50
Distance: $14.40
Time: $5.40
Booking fee: $2.75
Total: $25.05

Charged to: Visa ending in 4242

Rate your trip: Did Marcus provide a great experience?
[Rate this trip] [Get help with this trip]

Uber Technologies, Inc.
1725 Third St, San Francisco, CA 94158""",
]

# ── 4. NEWSLETTERS / MARKETING (LEGITIMATE) ──────────────────
LEGITIMATE_EMAILS += [
    """From: HubSpot <newsletter@hubspot.com>
To: subscriber@company.com
Subject: 📊 The State of Marketing 2026: Key Findings Inside

Hi [Name],

We just released our annual State of Marketing Report, and the insights this year are fascinating.

Here are 3 findings you need to know:

1. AI is now used by 78% of marketers
The adoption of AI tools has nearly doubled since last year. Marketers using AI report saving an average of 5 hours per week on content creation alone.

2. Short-form video continues to dominate
TikTok and Instagram Reels generate 3x more engagement than static posts. Brands that post 5+ short videos per week see 2x follower growth.

3. Email marketing ROI remains unbeatable
For every $1 spent on email marketing, companies see an average return of $42. Segmented campaigns perform 760% better than one-size-fits-all sends.

[Read the Full Report →]

Want more marketing insights like this? Subscribe to our weekly newsletter.

The HubSpot Team
HubSpot, Inc. | 25 First Street | Cambridge, MA 02141
Unsubscribe | Privacy Policy | Terms""",

    """From: Notion <team@makenotion.com>
To: user@email.com
Subject: New in Notion: AI writing assistant, improved tables, and more

Hey [Name] 👋

We've been busy building new features based on your feedback. Here's what's new this month:

✨ Notion AI is now available to all users
Our AI writing assistant can now help you draft documents, summarize pages, fix grammar, and brainstorm ideas. Try it by typing /AI in any Notion page.

📊 Redesigned Database Views
We completely rebuilt our table and board views. They're faster, more flexible, and support up to 50,000 rows without slowing down.

🔗 Improved Link Previews
Paste any link into Notion and see a rich preview with title, description, and image automatically. Works with 500+ sites.

📱 iOS & Android Updates
The mobile apps got a significant performance boost. Pages load 3x faster on mobile devices.

[Explore What's New →]

As always, if you have feedback or questions, reply to this email or reach us at team@notion.so.

The Notion Team""",
]

# ── 5. SOCIAL / PERSONAL ─────────────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Michael Johnson <michael.j@gmail.com>
To: friend@email.com
Subject: Re: Dinner plans for Saturday?

Hey!

Saturday works perfectly for me. I checked out that new Italian restaurant you mentioned - Trattoria Roma on 5th Ave - and the reviews look great. They have outdoor seating too which would be nice if the weather holds up.

I was thinking we could meet around 7pm? That gives us time to have drinks first at that rooftop bar nearby (Skybar).

Can you make a reservation? I tried calling but there's a waitlist so you might need to book through OpenTable. Last time I checked they had availability at 7:15.

Also, should we invite Tom and Lisa? They've been asking about getting together and it might be a good time to catch up with everyone.

Let me know!
Mike

P.S. Did you end up getting those concert tickets for July?""",

    """From: University Admissions <admissions@university.edu>
To: applicant@email.com
Subject: Application Decision - Class of 2030

Dear [Applicant Name],

On behalf of the Admissions Committee, it is my pleasure to inform you that you have been admitted to the University for the Class of 2030.

Your academic achievements, personal statement, and letters of recommendation were truly impressive. We believe you will make a significant contribution to our campus community.

Next steps:
1. Accept your admission offer by May 1, 2026 at admissions.university.edu/accept
2. Submit your enrollment deposit of $500 (credited toward tuition)
3. Complete the housing application by May 15, 2026
4. Attend New Student Orientation: August 24-27, 2026

Your academic program: Computer Science, College of Engineering
Financial aid information will be emailed separately.

We look forward to welcoming you to our campus community!

Sincerely,
Dr. Patricia Reynolds
Dean of Admissions
University of Excellence
admissions@university.edu | (555) 123-4567""",
]

# ── 6. CUSTOMER SUPPORT ──────────────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Zendesk Support <support@company.zendesk.com>
To: customer@email.com
Subject: [Ticket #8472] Re: Issue with account login

Hi [Customer Name],

Thank you for contacting support. My name is Alex, and I'll be helping you today.

I've reviewed your account and I can see the issue. Your account was temporarily locked after 5 incorrect password attempts, which is our standard security measure to protect accounts.

I've unlocked your account. Here's what to do next:

1. Go to company.com/login
2. Click "Forgot Password"
3. Enter your email address: customer@email.com
4. Check your email for the reset link (valid for 24 hours)
5. Create a new password (must be 8+ characters with a number and symbol)

If you continue to have trouble, please reply to this email and I'll assist further.

Is there anything else I can help you with today?

Best regards,
Alex Thompson
Customer Support Specialist
Company Inc. | support@company.com | 1-800-555-0199
Hours: Monday-Friday, 9 AM - 6 PM EST""",

    """From: Airbnb <automated@airbnb.com>
To: host@email.com
Subject: New booking request from Sarah M. for your apartment

Hi [Host Name],

You have a new booking request!

Guest: Sarah M. (4.9 ⭐ · 47 reviews)
Check-in: May 15, 2026
Check-out: May 20, 2026
Guests: 2 adults
Total earnings: $547.50 (after Airbnb fee)

Sarah wrote:
"Hi! My partner and I will be visiting for a work conference. We're quiet, respectful guests and look forward to staying in your lovely space. We'll mostly be out during the day."

You have 24 hours to accept or decline this request.

[Accept] [Decline]

About Sarah:
✓ Identity verified
✓ No negative reviews
✓ Member since 2019

Questions? Message Sarah directly through the Airbnb app.

Airbnb, Inc. | 888 Brannan St, San Francisco, CA 94103""",
]

# ── 7. SECURITY NOTIFICATIONS (LEGITIMATE) ───────────────────
LEGITIMATE_EMAILS += [
    """From: Google <no-reply@accounts.google.com>
To: user@gmail.com
Subject: Security alert for your linked Google Account

Your Google Account [user@gmail.com] was just signed in to from a new device.

Device: MacBook Pro
Location: San Francisco, CA, USA  
Time: April 24, 2026, 10:23 AM PDT

If this was you:
You can ignore this email.

If this wasn't you:
Check your account activity at myaccount.google.com/notifications and consider changing your password.

You can also review all devices where your account is signed in at myaccount.google.com/device-activity

The Google Accounts Team

Google LLC
1600 Amphitheatre Parkway
Mountain View, CA 94043, USA""",

    """From: GitHub Security <security@github.com>
To: developer@email.com
Subject: [GitHub] A new public key was added to your account

Hey developer,

We wanted to let you know that a new SSH key was added to your GitHub account.

Key added: April 24, 2026 at 2:34 PM UTC
Key type: Ed25519
Key fingerprint: SHA256:abc123...

If you added this key, you can safely disregard this email.

If you did NOT add this key, please visit github.com/settings/keys immediately to remove it and consider changing your password.

The GitHub Team

To unsubscribe from these emails, change your notification settings at github.com/settings/notifications""",
]

# ── 8. SYSTEM / AUTOMATED NOTIFICATIONS (LEGITIMATE) ─────────
LEGITIMATE_EMAILS += [
    """From: Railway <noreply@railway.app>
To: developer@email.com
Subject: Your deployment was successful

Hi,

Your deployment to production was successful!

Project: PhishGuard Backend
Environment: Production  
Service: PhishGuardBackend
Commit: abc1234 - "feat: add email tracking"
Deployed: April 24, 2026 at 3:47 PM UTC
Build time: 63 seconds

Your service is live at: https://phishguardbackend-production.up.railway.app

View deployment logs: railway.app/project/abc123/deployments

Happy building!
Railway Team

You received this because you have deployment notifications enabled.
Manage notifications at railway.app/account/notifications""",

    """From: Vercel <noreply@vercel.com>
To: developer@email.com
Subject: Your deployment is ready

Hi developer,

Your latest deployment on Vercel is ready.

Project: phishguard
Environment: Production
Branch: main
Commit: 4a0f278 by VinceBrun
Duration: 53 seconds
Status: ✅ Ready

[Visit deployment](https://phishguard-training.vercel.app)

To manage notifications, visit vercel.com/account/notifications

Vercel Inc.
340 Pine Street, 5th Floor
San Francisco, CA 94104""",

    """From: PagerDuty <no-reply@pagerduty.com>
To: oncall@company.com
Subject: RESOLVED: High CPU usage on production servers

INCIDENT RESOLVED

Incident: High CPU usage on production servers
Duration: 23 minutes
Impact: Degraded API response times (avg +340ms)
Root cause: Unoptimized database query in search endpoint
Resolution: Query optimized, indexes added

Timeline:
14:23 UTC - Alert triggered (CPU > 90%)
14:31 UTC - Engineer paged
14:46 UTC - Root cause identified
14:47 UTC - Fix deployed
14:51 UTC - Incident resolved

This incident has been resolved. No further action required.

PagerDuty Incident Management""",
]

# ── 9. EDUCATIONAL / INFORMATIONAL ───────────────────────────
LEGITIMATE_EMAILS += [
    """From: Coursera <no-reply@m.mail.coursera.org>
To: learner@email.com
Subject: You're making great progress! Keep going 🎓

Hi [Learner Name],

You're on a roll! Here's your learning update for this week:

This week's progress:
✅ Completed: Introduction to Python - Module 3
📚 In progress: Data Structures and Algorithms - 67% complete
⏰ Time learned: 4 hours 23 minutes

Your learning streak: 12 days 🔥

You're ranked in the top 15% of learners in Python for Everybody!

Continue where you left off:
[Continue Learning - Data Structures](https://www.coursera.org/learn/python)

Your certificate is just 2 modules away. You've got this!

The Coursera Team

Coursera Inc. | 381 E Evelyn Ave, Mountain View, CA 94041
Unsubscribe | Privacy Policy""",
]

# ── 10. HEALTHCARE ───────────────────────────────────────────
LEGITIMATE_EMAILS += [
    """From: City Medical Center <appointments@citymedical.org>
To: patient@email.com
Subject: Appointment Reminder - Dr. Johnson - April 28, 2026

Dear [Patient Name],

This is a reminder of your upcoming appointment:

Provider: Dr. Sarah Johnson, MD
Specialty: Internal Medicine
Date: Monday, April 28, 2026
Time: 10:30 AM
Location: City Medical Center, 456 Health Ave, Suite 200

Please remember to:
✓ Bring your insurance card and photo ID
✓ Arrive 15 minutes early to complete paperwork
✓ List current medications
✓ Bring any relevant medical records

Need to reschedule? Please call (555) 456-7890 or visit our patient portal at citymedical.org/portal at least 24 hours in advance.

For questions about your appointment, please call our scheduling team at (555) 456-7890.

City Medical Center
Patient Services Team""",
]

# ── 11. FAMILY / PERSONAL ────────────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Mom <margaret.smith@gmail.com>
To: son@gmail.com
Subject: Thanksgiving plans

Hi sweetheart,

I wanted to reach out about Thanksgiving. Your Aunt Carol and Uncle Pete are coming this year along with their kids, so we'll have a full house! We're thinking of having dinner at 3pm so people have time to drive home later.

Could you let me know if you're planning to come? And if so, are you bringing anyone special? 😊 

Your sister said she can't make it this year because of work, which is sad, but she'll try to video call during dinner.

Also, I was thinking you could bring that green bean casserole recipe you made last Christmas - it was so delicious! If you need the recipe for the rolls, just let me know.

Dad sends his love. He's been busy in the garden but asks about you all the time.

Love you lots,
Mom

P.S. Can you call sometime this weekend? It would be lovely to catch up properly!""",
]

# ── 12. REAL COMPANY RECEIPTS ────────────────────────────────
LEGITIMATE_EMAILS += [
    """From: Spotify <no-reply@spotify.com>
To: user@email.com
Subject: Your Spotify receipt

Hi [Name],

Here's your receipt.

Spotify Premium Individual
Billing date: April 24, 2026
Amount: $11.99 USD
Payment method: Visa •••• 4242

Your subscription will auto-renew on May 24, 2026.

Manage your subscription at spotify.com/account

Questions? Visit spotify.com/help

Spotify AB
Regeringsgatan 19
111 53 Stockholm, Sweden""",

    """From: Dropbox <no-reply@dropbox.com>
To: user@email.com
Subject: [Name] shared a folder with you

Hi,

[Name] (name@email.com) has shared a folder with you on Dropbox.

Folder name: Q4 Project Files
Shared by: Name (name@email.com)
Permission: Can view and comment

[Open folder in Dropbox]

What's in this folder?
The sender has 24 files in this folder including Word documents, Excel spreadsheets, and PDF files.

If you don't have a Dropbox account, you can view the contents by creating a free account.

The Dropbox Team

Dropbox, Inc. | 1800 Owens Street | San Francisco, CA 94158
© 2026 Dropbox
Unsubscribe | Privacy Policy | Terms of Service""",
]

print(f"Generated {len(PHISHING_EMAILS)} phishing emails")
print(f"Generated {len(LEGITIMATE_EMAILS)} legitimate emails")

# ============================================================
# BUILD THE DATASET
# ============================================================

# Balance: augment to get equal numbers
# Each template gets variations through minor text changes
def augment_email(email, n=3):
    """Create slight variations of emails for more training diversity"""
    variations = [email]
    replacements = [
        ("immediately", "right away"),
        ("URGENT", "IMPORTANT"),
        ("click here", "click the link below"),
        ("verify", "confirm"),
        ("account", "profile"),
        ("24 hours", "48 hours"),
        ("suspended", "limited"),
        ("Dear", "Hello"),
    ]
    for i in range(n):
        variant = email
        # Apply random replacements
        for old, new in random.sample(replacements, min(3, len(replacements))):
            if old.lower() in variant.lower():
                variant = re.sub(re.escape(old), new, variant, count=1, flags=re.IGNORECASE)
        variations.append(variant)
    return variations

# Augment phishing emails
all_phishing = []
for email in PHISHING_EMAILS:
    all_phishing.extend(augment_email(email, n=4))

# Augment legitimate emails  
all_legitimate = []
for email in LEGITIMATE_EMAILS:
    all_legitimate.extend(augment_email(email, n=4))

print(f"\nAfter augmentation:")
print(f"Phishing: {len(all_phishing)}")
print(f"Legitimate: {len(all_legitimate)}")

# Create balanced dataset
min_count = min(len(all_phishing), len(all_legitimate))
random.shuffle(all_phishing)
random.shuffle(all_legitimate)

phishing_sample = all_phishing[:min_count]
legitimate_sample = all_legitimate[:min_count]

# Build dataframe
data = []
for email in phishing_sample:
    data.append({'email_text': email.strip(), 'label': 1})
for email in legitimate_sample:
    data.append({'email_text': email.strip(), 'label': 0})

df = pd.DataFrame(data)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df = df.drop_duplicates(subset=['email_text'])

print(f"\nFinal dataset: {len(df)} emails")
print(f"Phishing: {len(df[df.label==1])}")
print(f"Legitimate: {len(df[df.label==0])}")
print(f"Avg email length: {df.email_text.str.len().mean():.0f} chars")
print(f"Unique words: {len(set(' '.join(df.email_text.tolist()).lower().split()))}")

# Load original dataset too and merge
df1 = pd.read_csv('/home/claude/ai-project/data/raw/perfect_phishing_dataset.csv')
df2 = pd.read_csv('/home/claude/ai-project/data/raw/spam_ham_dataset.csv')
df2_clean = pd.DataFrame({
    'email_text': df2['text'],
    'label': df2['label_num']
})

# Combine everything
combined = pd.concat([df, df1, df2_clean], ignore_index=True)
combined = combined.drop_duplicates(subset=['email_text'])
combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)
combined = combined.dropna(subset=['email_text', 'label'])
combined['label'] = combined['label'].astype(int)

print(f"\nFinal combined dataset: {len(combined)} emails")
print(f"Phishing: {len(combined[combined.label==1])}")
print(f"Legitimate: {len(combined[combined.label==0])}")

combined.to_csv('/home/claude/ai-project/data/processed/world_class_training_data.csv', index=False)
print("\n✓ Dataset saved!")
