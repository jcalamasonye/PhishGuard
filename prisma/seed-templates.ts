import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding world-class system templates and quizzes...\n');

  // ============================================
  // SYSTEM EMAIL TEMPLATES
  // ============================================
  console.log('Creating system email templates...');

  const templates = [
    {
      name: 'Microsoft 365 Password Expiry Alert',
      description: 'Impersonates a Microsoft 365 security alert about an expiring password. Exploits users\' fear of losing access to work systems. One of the most effective enterprise phishing vectors.',
      difficulty: 'EASY' as const,
      category: 'PASSWORD' as const,
      subject: 'Action Required: Your Microsoft 365 Password Expires in 24 Hours',
      fromName: 'Microsoft 365 Security',
      fromEmail: 'security-alert@microsoft365-notifications.com',
      body: `Dear {{user_name}},

Your Microsoft 365 password is scheduled to expire in 24 hours. To avoid losing access to your email, Teams, SharePoint, and other Microsoft services, you must update your password immediately.

Your account will be locked at: ${new Date(Date.now() + 24*60*60*1000).toLocaleString('en-US', {dateStyle:'long', timeStyle:'short'})}

If your account is locked, you will be unable to:
• Send or receive emails
• Access Microsoft Teams meetings
• View SharePoint documents
• Use any Microsoft 365 applications

Click the button below to update your password now. The process takes less than 2 minutes.`,
      ctaText: 'Update Password Now',
      ctaUrl: 'https://login.microsoft365-secure.com/password/update',
      redFlags: [
        'Sender domain is "microsoft365-notifications.com" — not microsoft.com',
        'Microsoft never emails you directly about password expiry',
        'Urgency tactic: "24 hours" deadline creates panic',
        'Link goes to "microsoft365-secure.com" not microsoft.com',
        'Generic "Dear {{user_name}}" — Microsoft uses your full name',
        'Threatening tone about losing access to critical services',
      ],
      isSystem: true,
    },
    {
      name: 'FedEx Undelivered Package Notice',
      description: 'Fake FedEx delivery failure notice requesting address confirmation and a small redelivery fee. Targets online shoppers who are expecting packages. Highly effective due to the volume of online deliveries.',
      difficulty: 'EASY' as const,
      category: 'PACKAGE' as const,
      subject: 'FedEx: Delivery Attempt Failed — Schedule Redelivery (#FX-2847-9012)',
      fromName: 'FedEx Delivery Services',
      fromEmail: 'noreply@fedex-delivery-tracking.net',
      body: `Dear {{user_name}},

We attempted to deliver your package at your address today but were unable to complete the delivery because no one was available to receive it.

Package Details:
Tracking Number: FX-2847-9012-3847
Estimated Weight: 2.3 lbs
Delivery Attempt: Today, 10:42 AM

Your package is currently being held at our local sorting facility. To avoid return-to-sender, you must schedule a redelivery within 48 hours.

A redelivery fee of $1.99 is required to confirm your delivery slot. Please have your payment card ready.

Note: If redelivery is not scheduled within 48 hours, your package will be returned to the sender and a restocking fee may apply.`,
      ctaText: 'Schedule Redelivery ($1.99)',
      ctaUrl: 'https://fedex-delivery-tracking.net/redelivery/confirm',
      redFlags: [
        'Domain is "fedex-delivery-tracking.net" — not fedex.com',
        'FedEx never charges a "redelivery fee" of $1.99',
        'Fake tracking number format (FedEx uses specific formats)',
        'Urgency: "48 hours" before package is returned',
        'No specific delivery address mentioned',
        'Requesting payment card information via email link',
        'Threatening "restocking fee" if not acted upon',
      ],
      isSystem: true,
    },
    {
      name: 'CEO Urgent Wire Transfer (BEC Attack)',
      description: 'Business Email Compromise attack impersonating the CEO requesting an urgent, confidential wire transfer. Targets finance team members. One of the costliest phishing attacks globally — businesses lose billions annually.',
      difficulty: 'HARD' as const,
      category: 'EXECUTIVE' as const,
      subject: 'Confidential — Urgent: Wire Transfer Authorization Needed Today',
      fromName: 'James Richardson, CEO',
      fromEmail: 'j.richardson@yourcompany-corp.net',
      body: `Hi {{user_name}},

I need your help with something time-sensitive. I am currently in a board meeting and cannot speak by phone. We are closing an acquisition today that has strict NDA requirements — please do not discuss this with anyone else on the team until the announcement tomorrow.

I need you to process an urgent wire transfer:

Amount: $47,250.00 USD
Beneficiary: Meridian Capital Partners LLC
Bank: JP Morgan Chase
Account Number: 8472910364
Routing Number: 021000021
Reference: ACQ-2024-MCP

This must be completed before 3:00 PM today to meet the closing deadline. Legal will send the documentation to your inbox within the next 30 minutes for your records.

Please confirm by email once the transfer is processed. I appreciate your discretion on this.

Best,
James Richardson
Chief Executive Officer`,
      ctaText: 'Confirm Transfer Processed',
      ctaUrl: 'https://yourcompany-corp.net/transfer/confirm',
      redFlags: [
        'Email domain is "yourcompany-corp.net" — not the real company domain',
        'CEOs do not email wire transfer requests directly to staff',
        'Request for absolute secrecy is a major red flag',
        'Pressure to act before 3 PM same day',
        '"Cannot speak by phone" to avoid voice verification',
        'NDA used to justify bypassing normal approval processes',
        '"Sent from iPhone" excuse for informal tone and short message',
        'No prior context or paper trail for the acquisition',
        'Requests email confirmation rather than using internal systems',
      ],
      isSystem: true,
    },
    {
      name: 'HR Annual Benefits Enrollment Deadline',
      description: 'Fake HR notification about benefits enrollment requiring sensitive personal information. Exploits employees\' concern about healthcare and financial benefits. Designed to harvest SSN, date of birth, and employee ID.',
      difficulty: 'MEDIUM' as const,
      category: 'HR' as const,
      subject: 'URGENT: Open Enrollment Closes Friday — Update Your Benefits Now',
      fromName: 'HR Benefits Administration',
      fromEmail: 'benefits-enrollment@hr-benefits-portal.com',
      body: `Dear {{user_name}},

This is your final reminder that the Annual Benefits Open Enrollment period closes this Friday at 5:00 PM EST. Employees who do not complete their enrollment will be automatically placed on the default plan, which carries a 23% higher premium deduction.

Changes effective January 1st include:
• Medical: New carrier options with updated copay structures
• Dental: Enhanced coverage for orthodontics and implants
• Vision: New frame allowance of $200 per year
• 401(k): Company match increased to 5% effective Q1

To review and confirm your selections, you will need to verify your identity using:
• Employee ID number
• Social Security Number (last 4 digits)
• Date of birth

This verification is required by our new benefits portal security policy.

Please complete your enrollment before Friday to avoid higher premium deductions starting January.`,
      ctaText: 'Complete Benefits Enrollment',
      ctaUrl: 'https://hr-benefits-portal.com/enrollment/verify',
      redFlags: [
        'Domain "hr-benefits-portal.com" is not your company\'s HR system domain',
        'Legitimate HR systems never ask for SSN via email link',
        'Threatening increased premiums creates financial pressure',
        'Generic HR department name with no specific contact person',
        'Requests multiple sensitive identifiers simultaneously',
        'Urgency: Friday deadline with financial consequences',
        'Real HR enrollment portals are accessed through the company intranet',
        'No mention of specific company name or HR system branding',
      ],
      isSystem: true,
    },
    {
      name: 'Chase Bank Suspicious Transaction Alert',
      description: 'Fake Chase bank security alert about suspicious account activity requiring immediate verification. Creates fear about financial loss to trigger hasty clicking. One of the top five most-clicked phishing templates globally.',
      difficulty: 'MEDIUM' as const,
      category: 'BANK' as const,
      subject: 'Security Alert: Suspicious Transaction Detected on Your Chase Account',
      fromName: 'Chase Security Center',
      fromEmail: 'security@chase-account-alerts.com',
      body: `Dear {{user_name}},

Our fraud detection system has identified a suspicious transaction on your Chase checking account that may not have been authorized by you.

Transaction Details:
Date: ${new Date().toLocaleDateString('en-US', {dateStyle:'long'})}
Merchant: Electronics Direct — International Purchase
Amount: $847.50 USD
Location: Lagos, Nigeria

If you did not authorize this transaction, your account may be compromised. To protect your funds:

1. Verify your identity immediately
2. Review and dispute the transaction
3. Secure your account with a new PIN

Your account has been temporarily limited to prevent further unauthorized transactions. You will not be able to make purchases until this is resolved.

Please verify your account within the next 2 hours. If we do not hear from you, we may place a permanent hold on your account for your security.`,
      ctaText: 'Verify Account & Dispute Transaction',
      ctaUrl: 'https://chase-account-alerts.com/verify/identity',
      redFlags: [
        'Domain is "chase-account-alerts.com" — not chase.com',
        'Chase\'s real domain is always chase.com — they never use third-party domains',
        'Transaction location chosen to create immediate fear (foreign country)',
        '2-hour deadline creates panic and prevents careful thinking',
        'Threat of "permanent hold" escalates urgency',
        'Real banks provide a callback phone number, not just a link',
        'No last four digits of account number shown (real alerts include this)',
        'Requests identity verification through an external link',
      ],
      isSystem: true,
    },
    {
      name: 'IT Department: MFA Enrollment Required',
      description: 'Fake IT security notice requiring Multi-Factor Authentication enrollment. Ironically uses security-themed language to bypass users\' defenses. Particularly effective as MFA rollouts are common in organizations.',
      difficulty: 'MEDIUM' as const,
      category: 'IT' as const,
      subject: 'IT Security: Multi-Factor Authentication Enrollment Required by End of Day',
      fromName: 'IT Security Operations',
      fromEmail: 'it-security@corporate-mfa-enrollment.com',
      body: `Dear {{user_name}},

As part of our ongoing commitment to protecting company data, IT Security is rolling out mandatory Multi-Factor Authentication (MFA) for all employee accounts.

Enrollment Deadline: Today at 5:00 PM

Employees who do not complete MFA enrollment by the deadline will have their accounts temporarily suspended until enrollment is completed. This is to ensure company-wide security compliance.

MFA enrollment takes approximately 3 minutes and requires:
• Your current username and password
• Your mobile phone number
• Verification of your employee email

Your account currently shows: NOT ENROLLED

Accounts without MFA enabled are the #1 vulnerability exploited by external attackers. The recent increase in targeted phishing attacks against our industry makes this enrollment critical.

Please click below to enroll immediately. If you have any issues, contact the IT help desk at ext. 4357.`,
      ctaText: 'Enroll in MFA Now',
      ctaUrl: 'https://corporate-mfa-enrollment.com/enroll/begin',
      redFlags: [
        'Domain "corporate-mfa-enrollment.com" is not your company\'s IT domain',
        'Real MFA enrollment is done through your company\'s identity provider (Microsoft, Okta, etc.)',
        'Account suspension threat creates urgency to bypass critical thinking',
        'Requests current username and password — real MFA never needs your password',
        'Generic "IT Security Operations" with no specific contact name',
        'Using security language ("phishing attacks") to make the phish seem legitimate',
        'Real IT communications come from your internal IT ticketing system',
        'Phone number provided (ext. 4357) is unverifiable from the email alone',
      ],
      isSystem: true,
    },
    {
      name: 'LinkedIn: Your Profile Appeared in 47 Searches',
      description: 'Social engineering attack impersonating LinkedIn, leveraging professional vanity and career anxiety. Gets users to "verify" their account using their LinkedIn credentials on a fake page.',
      difficulty: 'EASY' as const,
      category: 'SOCIAL' as const,
      subject: 'Your LinkedIn profile appeared in 47 searches this week',
      fromName: 'LinkedIn Notifications',
      fromEmail: 'notifications@linkedin-activity-alerts.com',
      body: `Hi {{user_name}},

Your LinkedIn profile has been getting attention! Here is your weekly activity summary:

Profile Appearances in Search: 47
Profile Views: 12
Post Impressions: 284
Connection Requests Pending: 3

Two recruiters from Fortune 500 companies viewed your profile this week. Your current job title and skills are matching active searches in your area.

However, we noticed your profile has some incomplete sections that may be limiting your visibility. Profiles with complete information appear up to 40x more in recruiter searches.

Additionally, your account requires verification to continue receiving these notifications and to ensure your profile data is secure.

To view who visited your profile and complete your verification, please sign in below.

Note: This verification link expires in 24 hours.`,
      ctaText: 'View Profile Visitors & Verify Account',
      ctaUrl: 'https://linkedin-activity-alerts.com/profile/verify',
      redFlags: [
        'Domain is "linkedin-activity-alerts.com" — not linkedin.com',
        'LinkedIn\'s real notification emails always come from @linkedin.com',
        'Fake engagement numbers designed to trigger professional curiosity',
        '"Fortune 500 recruiter" mention creates career anxiety to drive clicks',
        'Urgency: "verification link expires in 24 hours"',
        'Asking you to "sign in" through an external link — phishing for credentials',
        'Real LinkedIn shows profile visitor data within the app, not through email links',
        'Mixing flattery (47 searches) with threat (account needs verification)',
      ],
      isSystem: true,
    },
    {
      name: 'Payroll: Direct Deposit Update Required',
      description: 'Fake payroll system notification requiring employees to update their banking information. Targets the one thing employees are most sensitive about — their salary. Highly effective across all industries.',
      difficulty: 'HARD' as const,
      category: 'PAYROLL' as const,
      subject: 'Payroll Action Required: Update Your Direct Deposit Information Before Friday',
      fromName: 'Payroll Services Department',
      fromEmail: 'payroll@company-payroll-portal.net',
      body: `Dear {{user_name}},

Our payroll system is transitioning to a new banking partner on Monday. As part of this transition, all employees must re-verify and update their direct deposit banking information by this Friday at 12:00 PM noon.

Employees who do not complete the update will experience a delay in receiving their paycheck. The affected pay period includes the payroll run scheduled for next week.

To update your direct deposit information, you will need:
• Your current bank account number
• Your bank routing number
• One piece of identification (last 4 digits of SSN)

The update process is simple and takes less than 5 minutes. Your information is protected using bank-level 256-bit encryption.

Employees in your department who have already completed the update: 8 of 12

Please do not delay — payroll delays are difficult to reverse once the processing window closes.`,
      ctaText: 'Update Direct Deposit Information',
      ctaUrl: 'https://company-payroll-portal.net/direct-deposit/update',
      redFlags: [
        'Domain "company-payroll-portal.net" is not your company\'s HR or payroll system',
        'Real payroll systems never request bank details via email',
        'Social pressure: "8 of 12 employees already completed" creates FOMO',
        'Threatening paycheck delay targets financial anxiety directly',
        'Fake "256-bit encryption" claim to appear legitimate and trustworthy',
        'Requests both bank account number AND SSN digits — over-collection of data',
        'Legitimate payroll changes are communicated through internal HR systems',
        'Friday deadline for "next week payroll" timeline is implausible',
      ],
      isSystem: true,
    },
  ];

  let templateCount = 0;
  for (const template of templates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name, isSystem: true },
    });
    if (!existing) {
      await prisma.emailTemplate.create({ data: template });
      templateCount++;
      console.log(`  ✓ Created template: ${template.name}`);
    } else {
      console.log(`  → Skipped (exists): ${template.name}`);
    }
  }
  console.log(`\nTemplates: ${templateCount} created\n`);

  // ============================================
  // WORLD-CLASS QUIZZES
  // ============================================
  console.log('Creating world-class security awareness quizzes...');

  const quizzes = [
    {
      title: 'Phishing Email Recognition — Fundamentals',
      description: 'Master the essential skills to identify phishing emails before they compromise your security. Covers the most common phishing tactics used in real-world attacks.',
      difficulty: 'EASY' as const,
      category: 'SECURITY' as const,
      timeLimit: 10,
      passingScore: 70,
      questions: [
        {
          question: 'You receive an email from "support@paypa1.com" asking you to verify your account. What is the most important red flag in this email?',
          options: [
            'The email has a professional logo',
            'The sender domain uses the number "1" instead of the letter "l" in "paypal"',
            'The email asks you to verify your account',
            'The email was sent during business hours',
          ],
          correctAnswer: 1,
          explanation: 'Typosquatting — replacing letters with visually similar characters or numbers — is one of the most common phishing tactics. "paypa1.com" uses the number 1 instead of the letter l. Always examine the full sender domain character by character before clicking any link.',
          order: 0,
        },
        {
          question: 'An email from your "IT department" says your password expires in 2 hours and you must click a link immediately or lose access. What should you do?',
          options: [
            'Click the link immediately — you cannot afford to lose access to your account',
            'Forward the email to colleagues to warn them',
            'Ignore it because your IT team handles password issues automatically',
            'Do NOT click the link — go directly to the official IT portal or call IT support to verify',
          ],
          correctAnswer: 3,
          explanation: 'Extreme urgency with a short deadline is a signature phishing tactic designed to stop you from thinking critically. Legitimate IT systems send password expiry notices well in advance and never require action through email links. Always verify by navigating directly to the known IT portal or calling the IT helpdesk directly.',
          order: 1,
        },
        {
          question: 'Which of the following email sender addresses is MOST likely to be a phishing attempt targeting a Chase Bank customer?',
          options: [
            'alerts@chase.com',
            'security@alerts.chase.com',
            'noreply@chase-secure-alerts.com',
            'donotreply@notifications.chase.com',
          ],
          correctAnswer: 2,
          explanation: '"chase-secure-alerts.com" is a completely separate domain from chase.com. Attackers create convincing-sounding domains that include the brand name but are entirely controlled by them. Legitimate Chase emails always come from @chase.com or a verified subdomain of chase.com (like @notifications.chase.com). The word "secure" in a domain should actually raise suspicion, not reduce it.',
          order: 2,
        },
        {
          question: 'You receive an email that looks exactly like a Microsoft notification. Before clicking any link, what is the single most reliable thing you should check?',
          options: [
            'Whether the email has the official Microsoft logo and color scheme',
            'Whether the email was sent during normal business hours',
            'Whether you have recently used any Microsoft services',
            'The actual URL of any link by hovering over it before clicking',
          ],
          correctAnswer: 3,
          explanation: 'Logos, colors, and formatting can be perfectly copied by attackers in minutes. Hovering over a link (without clicking) reveals the actual destination URL in your browser\'s status bar. If the URL does not match the legitimate domain exactly, it is phishing. This is the single most reliable pre-click check you can perform.',
          order: 3,
        },
        {
          question: 'An email claiming to be from your CEO asks you to purchase 10 × $100 Amazon gift cards urgently for a client meeting and email the codes. This is:',
          options: [
            'Legitimate — CEOs sometimes need gift cards for client entertainment',
            'Suspicious but probably fine if the email address looks correct',
            'A gift card scam — a common social engineering attack where the "CEO" is an impersonator',
            'A test from your company\'s IT security team',
          ],
          correctAnswer: 2,
          explanation: 'Gift card scams are among the fastest-growing forms of social engineering. No legitimate business expense — including client gifts — is paid by purchasing retail gift cards and emailing the codes. The "CEO" is almost always an impersonator using a spoofed or lookalike email address. Always verify unusual financial requests with a direct phone call to the person\'s known number.',
          order: 4,
        },
        {
          question: 'Which action provides the STRONGEST protection against email phishing attacks?',
          options: [
            'Using a strong, unique password for your email account',
            'Enabling Multi-Factor Authentication (MFA) on all accounts',
            'Only opening emails from people you know',
            'Installing antivirus software on your computer',
          ],
          correctAnswer: 1,
          explanation: 'Multi-Factor Authentication (MFA) is the single most effective defense against phishing. Even if attackers steal your password through a phishing attack, they cannot access your account without the second factor (your phone, authenticator app, or hardware key). Microsoft reports that MFA blocks 99.9% of automated account compromise attacks.',
          order: 5,
        },
        {
          question: 'You click a link in a suspicious email by mistake. What should you do IMMEDIATELY?',
          options: [
            'Close the browser tab and hope nothing bad happened',
            'Enter your credentials quickly to see if the site is real, then log out',
            'Disconnect from the network, do NOT enter any credentials, and report it to IT security immediately',
            'Run a full system scan and continue working normally',
          ],
          correctAnswer: 2,
          explanation: 'Time is critical after clicking a suspicious link. Disconnect from Wi-Fi or unplug the network cable immediately to prevent any potential malware from communicating externally. Do NOT enter any credentials — you may already be on a credential-harvesting site. Report to IT security immediately so they can investigate, scan your device, and monitor for signs of compromise. Speed of response significantly limits the damage.',
          order: 6,
        },
      ],
    },
    {
      title: 'Advanced Social Engineering & Business Email Compromise',
      description: 'Develop expert-level skills to detect sophisticated social engineering attacks including BEC scams, spear phishing, and executive impersonation — the attacks that bypass technical defenses.',
      difficulty: 'HARD' as const,
      category: 'EXECUTIVE' as const,
      timeLimit: 15,
      passingScore: 75,
      questions: [
        {
          question: 'Business Email Compromise (BEC) attacks cost organizations over $2.9 billion annually. What makes BEC attacks particularly effective compared to standard phishing?',
          options: [
            'They use malware that bypasses antivirus software',
            'They target multiple employees simultaneously with the same email',
            'They use highly personalized, contextually accurate content based on researched targets — often with no malicious links or attachments',
            'They always impersonate IT departments and are easy to identify',
          ],
          correctAnswer: 2,
          explanation: 'BEC attacks are devastatingly effective precisely because they often contain no malicious links, no attachments, and no obvious red flags. Attackers research their targets extensively through LinkedIn, company websites, and social media to craft hyper-personalized messages that reference real projects, real colleagues, and real business contexts. Traditional email security tools cannot detect them because the emails themselves are technically "clean."',
          order: 0,
        },
        {
          question: 'Your CFO calls you and asks you to process a $50,000 wire transfer urgently. The request seems legitimate. What is the most important verification step?',
          options: [
            'Ask the CFO to send the request by email for a paper trail',
            'Call the CFO back on their known, pre-established phone number — not a number provided in the current communication',
            'Check that the wire transfer amount is within normal business parameters',
            'Verify with your direct manager before processing',
          ],
          correctAnswer: 1,
          explanation: 'This is called "callback verification" — and the critical detail is calling a PRE-ESTABLISHED number (one in your contacts, the company directory, or on the official website) — NOT a number provided in the suspicious call or email. Voice impersonation technology (deepfake audio) can now clone voices from publicly available recordings. Always verify financial requests through an independently known communication channel.',
          order: 1,
        },
        {
          question: 'What is "spear phishing" and why is it significantly more dangerous than regular phishing?',
          options: [
            'Spear phishing uses more sophisticated malware than standard phishing attacks',
            'Spear phishing targets multiple people at once, increasing the chance of success',
            'Spear phishing is highly targeted, using personalized information about the specific victim to make the attack highly credible',
            'Spear phishing attacks are sent through SMS rather than email',
          ],
          correctAnswer: 2,
          explanation: 'Spear phishing attacks are personalized for a specific individual using information gathered from LinkedIn profiles, company websites, social media, and even data breaches. An attacker might reference your boss by name, mention a real project you\'re working on, or use your job title and company name. This personalization dramatically increases the click rate — targeted spear phishing has a 70%+ success rate versus 3% for generic phishing campaigns.',
          order: 2,
        },
        {
          question: 'You receive an email from a vendor you regularly work with, requesting you update their payment account details for future invoices. What is the correct response?',
          options: [
            'Update the details immediately — the vendor\'s email address matches previous correspondence',
            'Reply to the email asking for confirmation of the change',
            'Call the vendor using contact details from your existing records (not the email) to verify the request independently',
            'Forward to your manager and update the details once they approve',
          ],
          correctAnswer: 2,
          explanation: 'Vendor payment diversion fraud — where attackers impersonate legitimate vendors to redirect payments to fraudulent accounts — costs organizations hundreds of millions annually. The key insight is that even a correctly-spoofed email from a known vendor address cannot be verified by replying to it (the reply also goes to the attacker). You must verify through an independently established channel: call the vendor\'s known phone number from previous records or the official website.',
          order: 3,
        },
        {
          question: 'Which of the following is the clearest indicator of a highly sophisticated whaling attack targeting a senior executive?',
          options: [
            'An email with spelling mistakes and poor grammar',
            'A request for gift cards from an unknown sender',
            'A carefully researched email referencing a real, recent business deal, using the correct names of legal counsel and advisors, requesting a wire transfer under strict NDA',
            'An email claiming the executive has won a prize',
          ],
          correctAnswer: 2,
          explanation: '"Whaling" targets high-value individuals (executives, CFOs, legal counsel). Sophisticated attacks reference real business contexts — actual merger negotiations, real legal team names, genuine business relationships — all gleaned from public filings, news articles, and LinkedIn. The NDA angle is particularly effective because it justifies bypassing normal approval processes and creates a plausible reason for secrecy. The sophistication of the attack is itself a red flag — more research went into it.',
          order: 4,
        },
      ],
    },
    {
      title: 'Password Security & Account Protection',
      description: 'Learn industry best practices for password security, MFA implementation, and account protection strategies that significantly reduce your risk of compromise.',
      difficulty: 'MEDIUM' as const,
      category: 'PASSWORD' as const,
      timeLimit: 10,
      passingScore: 70,
      questions: [
        {
          question: 'Which of the following passwords is MOST secure against a brute-force attack?',
          options: [
            'P@ssw0rd2024!',
            'correct-horse-battery-staple',
            'Xk9#mQ2$',
            'MyDogFluffy2019',
          ],
          correctAnswer: 1,
          explanation: 'A passphrase of four random common words ("correct-horse-battery-staple") is both highly secure and memorable. Its length (28 characters) gives it vastly more entropy than short complex passwords. "P@ssw0rd2024!" uses predictable letter substitutions (a→@, o→0) that password crackers specifically target. Length is more important than complexity — a 30-character passphrase is far stronger than an 8-character symbol-filled password.',
          order: 0,
        },
        {
          question: 'Your colleague mentions they use the same password for work systems and personal accounts "because it\'s strong and hard to guess." What is the primary risk of this approach?',
          options: [
            'It violates company password policy but poses no real security risk',
            'If any site with that password is breached, attackers use credential stuffing to access all other accounts including work systems',
            'Strong passwords are safe to reuse because they cannot be cracked',
            'The risk is minimal if the password has not been used for more than 2 years',
          ],
          correctAnswer: 1,
          explanation: 'Credential stuffing is one of the most common account takeover methods. When any service is breached (and billions of credentials are leaked annually), attackers automatically test those username/password combinations against hundreds of other services including banking, email, and corporate systems. Password reuse turns one breach into a catastrophic multi-account compromise. Use a unique password for every account — a password manager makes this practical.',
          order: 1,
        },
        {
          question: 'Which type of Multi-Factor Authentication (MFA) provides the STRONGEST protection against phishing?',
          options: [
            'SMS text message codes',
            'Email verification codes',
            'Time-based authenticator app codes (TOTP)',
            'Hardware security keys (FIDO2/WebAuthn)',
          ],
          correctAnswer: 3,
          explanation: 'Hardware security keys (like YubiKey) using the FIDO2/WebAuthn standard are phishing-proof by design. Unlike SMS codes (vulnerable to SIM-swapping), email codes (vulnerable to account compromise), or even TOTP apps (vulnerable to real-time phishing proxies), hardware keys cryptographically verify the actual website domain before authenticating. An attacker cannot use a stolen FIDO2 code on a fake site — the key refuses to authenticate on unrecognized domains.',
          order: 2,
        },
        {
          question: 'You receive a legitimate-looking notification that your email password was recently changed from a new device. You did NOT make this change. What should you do first?',
          options: [
            'Reply to the email asking who changed the password',
            'Click "Secure My Account" in the notification email immediately',
            'Go DIRECTLY to the email provider\'s official website (type the URL manually) and use the account recovery process — do not click links in the notification',
            'Wait 24 hours to see if you regain access automatically',
          ],
          correctAnswer: 2,
          explanation: 'This scenario presents a double-phishing risk: the notification itself may be fake, designed to get you to click "Secure My Account" (which actually harvests your credentials). Even if the notification is real, you should not click links in emails about account security events — always navigate directly to the service by typing the URL in your browser. Use the official account recovery process. Every minute you wait increases attacker dwell time in your compromised account.',
          order: 3,
        },
        {
          question: 'What is the most important benefit of using a dedicated password manager for all your accounts?',
          options: [
            'Password managers encrypt your passwords so they cannot be stolen by hackers',
            'Password managers allow you to use simple, memorable passwords securely',
            'Password managers enable truly unique, random passwords for every site while requiring you to remember only one master password',
            'Password managers automatically change your passwords every 90 days',
          ],
          correctAnswer: 2,
          explanation: 'The core value proposition of a password manager is that it enables a security practice (unique random password per site) that would be humanly impossible without it. A 20-character random password like "kX9#mQ2$vL7@nP4!wR8&" is unguessable, and with a password manager you never need to remember it. The single master password is the only one you must create and memorize securely. This completely eliminates credential stuffing risk across your accounts.',
          order: 4,
        },
      ],
    },
    {
      title: 'Identifying Phishing Websites & Safe Browsing',
      description: 'Develop skills to identify fraudulent websites, understand HTTPS security, and practice safe browsing habits that protect you even after clicking a suspicious link.',
      difficulty: 'MEDIUM' as const,
      category: 'IT' as const,
      timeLimit: 10,
      passingScore: 70,
      questions: [
        {
          question: 'A website has a padlock icon and "https://" in the address bar. Does this mean the website is safe and legitimate?',
          options: [
            'Yes — HTTPS means the site is verified and trustworthy',
            'Yes — the padlock means the site owner has been vetted by a trusted authority',
            'No — HTTPS only means the connection is encrypted, not that the site itself is legitimate. Phishing sites routinely use HTTPS.',
            'Only if the padlock is green — a grey padlock indicates a fake site',
          ],
          correctAnswer: 2,
          explanation: 'This is one of the most dangerous security misconceptions. Over 80% of phishing sites now use HTTPS and display the padlock icon. HTTPS (the padlock) only means your connection to the site is encrypted — it says nothing about whether the site owner is who they claim to be. A phishing site at https://paypa1.com can have a perfect padlock. Always verify the actual domain name in the address bar, not just the padlock.',
          order: 0,
        },
        {
          question: 'You are on what appears to be your company\'s login page. Which URL indicates you are on the LEGITIMATE site?',
          options: [
            'https://secure-yourcompany-login.com',
            'https://yourcompany.com.auth.net/login',
            'https://yourcompany.com/login',
            'https://login.yourcompany-secure.com',
          ],
          correctAnswer: 2,
          explanation: 'In a URL, the legitimate domain is always the part immediately before the last slash-free segment and the TLD (.com, .org, etc.). In "yourcompany.com.auth.net/login" — the actual domain is auth.net, not yourcompany.com. In "yourcompany-secure.com" — this is a completely different domain with "yourcompany" as a prefix. Only "yourcompany.com/login" has yourcompany.com as the actual domain. Subdomains (before the first dot) can be anything — only what comes before .com matters.',
          order: 1,
        },
        {
          question: 'Which of the following is the safest approach when you receive an email claiming to be from your bank with an "urgent" link?',
          options: [
            'Click the link if the email design and logo look exactly like your real bank',
            'Check that the link starts with https:// before clicking',
            'Hover over the link to check the URL, then click if it looks right',
            'Close the email, open a new browser tab, and type your bank\'s URL directly',
          ],
          correctAnswer: 3,
          explanation: 'The safest approach to any emailed link to a sensitive service is to not click the link at all. Opening a new browser tab and typing the bank\'s URL directly ensures you land on the genuine site, completely bypassing any phishing attempt. This approach eliminates all URL-spoofing, redirect, and homograph attack risks. For banking, finance, healthcare, and work systems — always navigate directly by typing the address.',
          order: 2,
        },
        {
          question: 'What is a "homograph attack" in the context of phishing?',
          options: [
            'An attack that copies the visual design of a legitimate website perfectly',
            'An attack using international Unicode characters that look identical to standard letters in domain names (e.g., Cyrillic "а" instead of Latin "a")',
            'An attack that creates identical copies of entire websites',
            'An attack that intercepts your connection to a legitimate website',
          ],
          correctAnswer: 1,
          explanation: 'Homograph attacks exploit the fact that many Unicode characters from different scripts look identical to Latin letters. A Cyrillic "а" is visually indistinguishable from a Latin "a" in most fonts. A domain like "аpple.com" using a Cyrillic "а" is a completely different domain from "apple.com" but looks identical. Modern browsers show internationalized domain names in their encoded form (xn--...) to counteract this, but vigilance remains important.',
          order: 3,
        },
      ],
    },
  ];

  let quizCount = 0;
  for (const quiz of quizzes) {
    const existing = await prisma.quiz.findFirst({ where: { title: quiz.title } });
    if (!existing) {
      const { questions, ...quizData } = quiz;
      await prisma.quiz.create({
        data: {
          ...quizData,
          questions: {
            create: questions,
          },
        },
      });
      quizCount++;
      console.log(`  ✓ Created quiz: ${quiz.title} (${questions.length} questions)`);
    } else {
      console.log(`  → Skipped (exists): ${quiz.title}`);
    }
  }

  console.log(`\nQuizzes: ${quizCount} created`);
  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });