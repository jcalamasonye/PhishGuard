import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  // Clean existing data (in reverse dependency order)
  console.log('[1/7] Cleaning existing data...');
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.emailEvent.deleteMany();
  await prisma.campaignParticipant.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log('  Done.\n');

  // Create organization
  console.log('[2/7] Creating organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'PhishGuard Demo Corp',
      domain: 'democorp.com',
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      fromEmail: 'security@democorp.com',
      fromName: 'DemoCorp Security',
    },
  });
  console.log(`  Organization: ${org.name} (${org.id})\n`);

  // Create users
  console.log('[3/7] Creating users...');
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@democorp.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'IT Security',
      organizationId: org.id,
    },
  });
  console.log(`  Admin: ${admin.email} / Admin@123`);

  const usersData = [
    { name: 'Sarah Johnson', email: 'sarah@democorp.com', department: 'Engineering' },
    { name: 'Michael Chen', email: 'michael@democorp.com', department: 'Marketing' },
    { name: 'Emily Davis', email: 'emily@democorp.com', department: 'Finance' },
    { name: 'James Wilson', email: 'james@democorp.com', department: 'Human Resources' },
    { name: 'Olivia Brown', email: 'olivia@democorp.com', department: 'Engineering' },
    { name: 'Daniel Garcia', email: 'daniel@democorp.com', department: 'Sales' },
    { name: 'Sophia Martinez', email: 'sophia@democorp.com', department: 'Marketing' },
    { name: 'Liam Anderson', email: 'liam@democorp.com', department: 'Finance' },
    { name: 'Ava Thomas', email: 'ava@democorp.com', department: 'Engineering' },
    { name: 'Noah Jackson', email: 'noah@democorp.com', department: 'Sales' },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: userPassword,
        role: 'USER',
        organizationId: org.id,
      },
    });
    users.push(user);
    console.log(`  User: ${user.email} / User@123`);
  }
  console.log('');

  // Create phishing email templates
  console.log('[4/7] Creating email templates...');
  const templates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Password Reset Alert',
        description: 'Fake password reset notification mimicking a corporate IT system. Uses urgency and a suspicious link to trick users into revealing credentials.',
        difficulty: 'EASY',
        category: 'PASSWORD',
        subject: 'Urgent: Your Password Will Expire in 24 Hours',
        fromName: 'IT Help Desk',
        fromEmail: 'helpdesk@democorp.com',
        body: 'Dear {{user_name}},\n\nYour corporate password will expire in 24 hours. To avoid losing access to your account, please reset your password immediately by clicking the link below:\n\nReset Password Now: http://democorp-password.com/reset\n\nIf you do not reset your password within 24 hours, your account will be locked and you will need to contact IT support.\n\nRegards,\nIT Help Desk\nDemoCorp',
        ctaText: 'Reset Password Now',
        ctaUrl: 'http://democorp-password.com/reset',
        redFlags: [
          'Misspelled sender domain (dem0corp vs democorp)',
          'Urgency tactics (24 hour deadline)',
          'Suspicious external link',
          'Generic greeting instead of your actual name',
          'Threatens account lockout',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Package Delivery Notice',
        description: 'Fake delivery notification pretending to be from a shipping company. Exploits curiosity about an unexpected package.',
        difficulty: 'EASY',
        category: 'PACKAGE',
        subject: 'Your Package Could Not Be Delivered - Action Required',
        fromName: 'UPS Delivery Team',
        fromEmail: 'delivery@ups-notifications.net',
        body: 'Dear Customer,\n\nWe attempted to deliver your package (Tracking #: UPS-8847291) but were unable to complete the delivery. The package is being held at our local facility.\n\nTo schedule a redelivery, please confirm your address:\n\nConfirm Delivery: http://ups-redelivery.net/confirm\n\nIf you do not respond within 48 hours, the package will be returned to sender.\n\nThank you,\nUPS Customer Service',
        ctaText: 'Confirm Delivery',
        ctaUrl: 'http://ups-redelivery.net/confirm',
        redFlags: [
          'Not a real UPS domain (ups-notifications.net)',
          'No specific recipient name',
          'Fake tracking number format',
          'External suspicious URL',
          'Urgency pressure (48 hours)',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'CEO Wire Transfer Request',
        description: 'Executive impersonation email requesting an urgent wire transfer. A classic Business Email Compromise (BEC) attack targeting finance departments.',
        difficulty: 'HARD',
        category: 'EXECUTIVE',
        subject: 'Confidential - Urgent Wire Transfer Needed',
        fromName: 'David Mitchell, CEO',
        fromEmail: 'david.mitchell@democorp-exec.com',
        body: 'Hi,\n\nI need you to process an urgent wire transfer for a confidential acquisition we are finalizing today. This is time-sensitive and must be completed before 3 PM.\n\nAmount: $47,500.00\nRecipient: Meridian Holdings LLC\nBank: First National Bank\nAccount: 2847591036\nRouting: 091000019\n\nPlease handle this discreetly and confirm once completed. Do not discuss this with others as the deal is not yet public.\n\nThanks,\nDavid Mitchell\nCEO, DemoCorp\n\nSent from my iPhone',
        ctaText: 'Process Transfer',
        redFlags: [
          'CEO would not email wire transfer requests directly',
          'External domain (democorp-exec.com) not company domain',
          'Urgency and secrecy pressure',
          'Requests bypassing normal approval process',
          '"Sent from my iPhone" to explain informal tone',
          'No prior context about this acquisition',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'HR Benefits Update',
        description: 'Fake HR notification about benefits enrollment. Targets employees with a form that harvests personal information.',
        difficulty: 'MEDIUM',
        category: 'HR',
        subject: 'Action Required: Annual Benefits Enrollment Closing Soon',
        fromName: 'HR Benefits Team',
        fromEmail: 'benefits@democorp-hr.org',
        body: 'Dear Employee,\n\nThis is a reminder that the annual benefits enrollment period closes on Friday. If you have not yet reviewed and updated your benefits selections, please do so immediately.\n\nTo update your benefits, click the link below:\n\nUpdate Benefits: http://democorp-benefits.org/enroll\n\nYou will need to verify your identity with your:\n- Employee ID\n- Social Security Number (last 4 digits)\n- Date of Birth\n\nFailure to complete enrollment by Friday will result in default coverage with higher premiums.\n\nBest regards,\nHR Benefits Team',
        ctaText: 'Update Benefits',
        ctaUrl: 'http://democorp-benefits.org/enroll',
        redFlags: [
          'External domain not matching company (democorp-hr.org)',
          'Requests sensitive personal information',
          'Generic greeting (Dear Employee)',
          'Deadline pressure',
          'Threatens financial consequences',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Bank Account Alert',
        description: 'Fake bank security alert claiming suspicious activity. Creates panic to rush users into clicking without thinking.',
        difficulty: 'MEDIUM',
        category: 'BANK',
        subject: 'Security Alert: Suspicious Activity on Your Account',
        fromName: 'Chase Security Center',
        fromEmail: 'alerts@chase-secure.net',
        body: 'Dear Valued Customer,\n\nWe have detected unusual activity on your Chase account ending in ****4821.\n\nDate: April 2, 2026\nTransaction: $2,847.00\nMerchant: Unknown International Transfer\nStatus: PENDING\n\nIf you did not authorize this transaction, please verify your identity immediately to prevent further unauthorized access:\n\nVerify Now: http://chase-secure.net/verify\n\nIf no action is taken within 12 hours, the transaction will be processed.\n\nChase Security Team\nThis is an automated message. Do not reply.',
        ctaText: 'Verify Now',
        ctaUrl: 'http://chase-secure.net/verify',
        redFlags: [
          'Not a real Chase domain (chase-secure.net)',
          'Creates panic with large unauthorized amount',
          'Tight deadline (12 hours)',
          'Generic greeting (Dear Valued Customer)',
          'Suspicious verification link',
          '"Do not reply" prevents questioning',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'IT Security Update',
        description: 'Fake IT department notification requiring a mandatory software update. Tricks users into downloading malware.',
        difficulty: 'MEDIUM',
        category: 'IT',
        subject: 'Mandatory Security Update - Install Before End of Day',
        fromName: 'IT Security Team',
        fromEmail: 'security@democorp.com',
        body: 'All Employees,\n\nOur security team has identified a critical vulnerability that affects all company workstations. A mandatory security patch must be installed today.\n\nPlease download and install the update from the link below:\n\nDownload Update: http://democorp-updates.com/patch\n\nInstructions:\n1. Click the link above\n2. Download the file SecurityPatch_v4.2.exe\n3. Run the installer as Administrator\n4. Restart your computer\n\nThis update is mandatory. Non-compliant machines will be disconnected from the network at 6 PM today.\n\nIT Security Team',
        ctaText: 'Download Update',
        ctaUrl: 'http://democorp.com/updates/patch',
        redFlags: [
          'Misspelled sender domain (democorp)',    
          'External download link for internal update',
          'Asks to run executable as Administrator',
          'Extreme urgency (end of day deadline)',
          'Threat of network disconnection',
          'Legitimate IT updates go through managed deployment, not email links',
        ],
        organizationId: org.id,
        isSystem: true,
      },
    }),
  ]);
  templates.forEach((t) => console.log(`  Template: ${t.name} (${t.difficulty})`));
  console.log('');

  // Create quizzes
  console.log('[5/7] Creating quizzes...');
  const generalQuiz = await prisma.quiz.create({
    data: {
      title: 'Phishing Awareness Basics',
      description: 'Test your knowledge of common phishing tactics and how to identify suspicious emails.',
      difficulty: 'EASY',
      category: 'SECURITY',
      timeLimit: 10,
      passingScore: 70,
      questions: {
        create: [
          {
            question: 'What is the MOST reliable way to verify if an email is legitimate?',
            options: [
              'Check if the email has a company logo',
              'Contact the sender through a known, trusted channel',
              'Check if the email is well-written with no typos',
              'See if the email was sent during business hours',
            ],
            correctAnswer: 1,
            explanation: 'Logos can be copied, grammar can be perfected, and emails can be sent anytime. The only reliable method is to verify through a separate trusted channel, such as calling the sender directly using a known phone number.',
            order: 0,
          },
          {
            question: 'You receive an email from your CEO asking you to urgently buy gift cards and send the codes. What should you do?',
            options: [
              'Buy the gift cards since the CEO asked',
              'Reply to the email asking for confirmation',
              'Contact the CEO through a different channel to verify',
              'Ignore the email completely',
            ],
            correctAnswer: 2,
            explanation: 'This is a classic CEO impersonation scam. Never reply to the suspicious email itself. Always verify through a separate channel like calling the CEO directly or asking in person.',
            order: 1,
          },
          {
            question: 'Which of these email addresses is MOST likely a phishing attempt?',
            options: [
              'support@microsoft.com',
              'support@micr0soft-help.com',
              'john.smith@company.com',
              'newsletter@updates.company.com',
            ],
            correctAnswer: 1,
            explanation: 'The address "micr0soft-help.com" uses a zero instead of the letter "o" and adds "-help" to create a look-alike domain. This is a common phishing tactic called typosquatting.',
            order: 2,
          },
          {
            question: 'What should you do BEFORE clicking a link in an email?',
            options: [
              'Check if the email has an unsubscribe link',
              'Make sure the email is not in your spam folder',
              'Hover over the link to preview the actual URL',
              'Check if other colleagues received the same email',
            ],
            correctAnswer: 2,
            explanation: 'Hovering over a link reveals the actual destination URL. Phishing emails often display one URL in the text but link to a completely different malicious site.',
            order: 3,
          },
          {
            question: 'Which of these is a RED FLAG in an email?',
            options: [
              'The email is addressed to you by your full name',
              'The email includes a specific project you are working on',
              'The email creates a sense of urgency with threats',
              'The email is from a colleague you regularly work with',
            ],
            correctAnswer: 2,
            explanation: 'Urgency and threats ("Your account will be locked!", "Act within 24 hours!") are hallmark phishing tactics designed to make you act before thinking critically.',
            order: 4,
          },
        ],
      },
    },
  });
  console.log(`  Quiz: ${generalQuiz.title}`);

  const advancedQuiz = await prisma.quiz.create({
    data: {
      title: 'Advanced Phishing Detection',
      description: 'Challenge yourself with harder scenarios including spear phishing, BEC attacks, and social engineering techniques.',
      difficulty: 'HARD',
      category: 'SECURITY',
      timeLimit: 15,
      passingScore: 70,
      questions: {
        create: [
          {
            question: 'What makes spear phishing MORE dangerous than regular phishing?',
            options: [
              'It uses more advanced technology',
              'It is personalized with specific details about the target',
              'It is sent from government agencies',
              'It always contains malware attachments',
            ],
            correctAnswer: 1,
            explanation: 'Spear phishing is targeted and uses personal information about the victim (name, role, projects, colleagues) making it much harder to detect than generic mass phishing.',
            order: 0,
          },
          {
            question: 'A Business Email Compromise (BEC) attack typically involves:',
            options: [
              'Sending malware through email attachments',
              'Impersonating an executive to request financial transactions',
              'Hacking into the company email server',
              'Sending mass spam emails to all employees',
            ],
            correctAnswer: 1,
            explanation: 'BEC attacks impersonate executives or trusted partners to trick employees into transferring money or sharing sensitive data. They rely on authority and urgency rather than malware.',
            order: 1,
          },
          {
            question: 'You receive a legitimate-looking email from HR about updating your direct deposit. The link goes to an HTTPS site with a padlock icon. Is it safe?',
            options: [
              'Yes, HTTPS and the padlock mean the site is legitimate',
              'No, anyone can get an HTTPS certificate for any domain',
              'Yes, if the email came from an internal address',
              'Only if the email passed spam filters',
            ],
            correctAnswer: 1,
            explanation: 'HTTPS only means the connection is encrypted, NOT that the site is legitimate. Attackers can easily obtain SSL certificates for phishing domains. Always verify the actual domain name.',
            order: 2,
          },
          {
            question: 'What is pretexting in the context of social engineering?',
            options: [
              'Sending text messages with malicious links',
              'Creating a fabricated scenario to gain trust and extract information',
              'Pretending to be a text-based AI assistant',
              'Adding disclaimers before sending phishing emails',
            ],
            correctAnswer: 1,
            explanation: 'Pretexting involves creating a believable cover story to manipulate the target. For example, pretending to be IT support doing a "security audit" to get someone to reveal their password.',
            order: 3,
          },
          {
            question: 'After clicking a suspicious link, what is the FIRST thing you should do?',
            options: [
              'Delete the email to remove the evidence',
              'Close the browser and hope nothing happened',
              'Disconnect from the network and report to IT security immediately',
              'Change your password on the suspicious site',
            ],
            correctAnswer: 2,
            explanation: 'Disconnecting from the network limits potential damage from malware, and reporting to IT security ensures the threat is properly investigated and contained. Never change passwords on the suspicious site itself.',
            order: 4,
          },
        ],
      },
    },
  });
  console.log(`  Quiz: ${advancedQuiz.title}`);
  console.log('');

  // Create a sample campaign with participants
  console.log('[6/7] Creating sample campaign...');
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Q1 2026 Phishing Awareness Test',
      description: 'First quarter phishing simulation targeting all departments to establish baseline awareness metrics.',
      status: 'COMPLETED',
      templateId: templates[0]!.id,
      organizationId: org.id,
      scheduledAt: new Date('2026-03-01T09:00:00Z'),
      launchedAt: new Date('2026-03-01T09:00:00Z'),
      completedAt: new Date('2026-03-08T17:00:00Z'),
      participants: {
        create: users.map((user, index) => ({
          userId: user.id,
          emailSentAt: new Date('2026-03-01T09:00:00Z'),
          emailOpenedAt: index < 8 ? new Date('2026-03-01T10:00:00Z') : null,
          linkClickedAt: index < 4 ? new Date('2026-03-01T10:30:00Z') : null,
          timeToClick: index < 4 ? (index + 1) * 300 : null,
          quizCompletedAt: index < 6 ? new Date('2026-03-02T14:00:00Z') : null,
          quizScore: index < 6 ? [80, 60, 100, 40, 90, 70][index] : null,
          isEmailSent: true,
          isEmailOpened: index < 8,
          isLinkClicked: index < 4,
          isQuizCompleted: index < 6,
        })),
      },
    },
  });
  console.log(`  Campaign: ${campaign.name}`);
  console.log(`  ${users.length} participants, 4 clicked, 6 completed quiz\n`);

  // Create quiz attempts
  console.log('[7/7] Creating quiz attempts...');
  const quizScores = [80, 60, 100, 40, 90, 70];
  for (let i = 0; i < 6; i++) {
    await prisma.quizAttempt.create({
      data: {
        quizId: generalQuiz.id,
        userId: users[i]!.id,
        answers: { q0: 1, q1: 2, q2: 1, q3: 2, q4: 2 },
        score: quizScores[i]!,
        timeSpent: 300 + i * 60,
        passed: quizScores[i]! >= 70,
        completedAt: new Date('2026-03-02T14:00:00Z'),
      },
    });
  }
  console.log('  Created 6 quiz attempts\n');

  // Summary
  console.log('='.repeat(50));
  console.log('Seed completed successfully.\n');
  console.log('Summary:');
  console.log(`  Organization:  ${org.name}`);
  console.log(`  Admin:         admin@democorp.com / Admin@123`);
  console.log(`  Users:         ${users.length} end users (User@123)`);
  console.log(`  Templates:     ${templates.length} phishing templates`);
  console.log(`  Quizzes:       2 (basic + advanced)`);
  console.log(`  Campaigns:     1 completed campaign`);
  console.log(`  Quiz Attempts: 6`);
  console.log('='.repeat(50));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });