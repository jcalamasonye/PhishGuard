import { Resend } from 'resend';
import { config } from '@/config';
import prisma from '@/utils/database';
import logger from '@/utils/logger';

// Resend client — uses RESEND_API_KEY from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Sending address — on Resend free tier use onboarding@resend.dev
// Once a domain is verified in Resend, change this to your real domain
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

function buildTrackingPixelUrl(campaignId: string, userId: string): string {
  return `${config.BACKEND_URL}/api/${config.API_VERSION}/email/track/open?cid=${campaignId}&uid=${userId}`;
}

function buildTrackingLinkUrl(campaignId: string, userId: string): string {
  return `${config.BACKEND_URL}/api/${config.API_VERSION}/email/track/click?cid=${campaignId}&uid=${userId}`;
}

function renderEmailBody(
  template: { body: string; ctaText: string | null; ctaUrl: string | null; fromName: string; subject: string },
  userName: string,
  campaignId: string,
  userId: string
): string {
  const trackingLink = buildTrackingLinkUrl(campaignId, userId);
  const trackingPixel = buildTrackingPixelUrl(campaignId, userId);

  const body = template.body
    .replace(/\{\{user_name\}\}/g, userName)
    .replace(/\{\{name\}\}/g, userName)
    .replace(/\[Name\]/g, userName)
    .replace(/Dear Customer/g, `Dear ${userName}`);

  const htmlBody = body
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p style="margin:0 0 14px 0;line-height:1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const ctaButton = template.ctaText
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td align="center">
            <a href="${trackingLink}"
               style="background-color:#1a56db;color:#ffffff;padding:14px 32px;
                      text-decoration:none;border-radius:6px;font-weight:600;
                      font-size:15px;display:inline-block;font-family:Arial,sans-serif;
                      letter-spacing:0.3px;">
              ${template.ctaText}
            </a>
          </td>
        </tr>
      </table>`
    : `<p style="margin:20px 0;">
        <a href="${trackingLink}" style="color:#1a56db;text-decoration:underline;">
          Click here to proceed
        </a>
      </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${template.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="background-color:#1e3a5f;padding:20px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;
                        letter-spacing:0.5px;font-family:Arial,sans-serif;">
                ${template.fromName}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 24px 32px;color:#1f2937;font-size:15px;">
              ${htmlBody}
              ${ctaButton}
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 28px 32px;color:#9ca3af;font-size:12px;line-height:1.6;">
              <p style="margin:0 0 6px 0;">
                This email was sent by ${template.fromName}.
                If you did not expect this email, please contact your IT security team.
              </p>
              <p style="margin:0;">
                &copy; ${new Date().getFullYear()} ${template.fromName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;margin-top:16px;">
          <tr>
            <td align="center" style="color:#9ca3af;font-size:11px;padding:0 20px;">
              You are receiving this email because you are a registered user.
              To unsubscribe, contact your administrator.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
  <img src="${trackingPixel}" width="1" height="1"
       style="display:block;width:1px;height:1px;border:0;opacity:0;" alt=""/>
</body>
</html>`;
}

export const emailService = {
  async sendCampaignEmails(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        organization: {
          select: { fromEmail: true, fromName: true },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const fromName = campaign.template.fromName ||
      campaign.organization?.fromName ||
      config.FROM_NAME;

    logger.info(`Sending campaign ${campaignId} emails via Resend from ${FROM_ADDRESS}`);

    let sentCount = 0;
    let failedCount = 0;

    for (const participant of campaign.participants) {
      try {
        const html = renderEmailBody(
          campaign.template,
          participant.user.name,
          campaignId,
          participant.user.id
        );

        const { error } = await resend.emails.send({
          from: `${fromName} <${FROM_ADDRESS}>`,
          to: participant.user.email,
          subject: campaign.template.subject,
          html,
        });

        if (error) {
          throw new Error(error.message);
        }

        await prisma.emailEvent.create({
          data: { eventType: 'sent', campaignId, userId: participant.user.id },
        });

        sentCount++;
        logger.info(`Email sent to ${participant.user.email} for campaign ${campaignId}`);
      } catch (err) {
        failedCount++;
        logger.error(`Failed to send email to ${participant.user.email}: ${err}`);
      }
    }

    logger.info(`Campaign ${campaignId} complete: ${sentCount} sent, ${failedCount} failed`);
    return { sentCount, failedCount, total: campaign.participants.length };
  },

  async recordOpen(campaignId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await prisma.emailEvent.create({
      data: { eventType: 'opened', campaignId, userId, ipAddress, userAgent },
    });

    await prisma.campaignParticipant.updateMany({
      where: { campaignId, userId, isEmailOpened: false },
      data: { isEmailOpened: true, emailOpenedAt: new Date() },
    });
  },

  async recordClick(campaignId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await prisma.emailEvent.create({
      data: { eventType: 'clicked', campaignId, userId, ipAddress, userAgent },
    });

    const participant = await prisma.campaignParticipant.findFirst({
      where: { campaignId, userId },
    });

    if (participant && !participant.isLinkClicked) {
      const timeToClick = participant.emailSentAt
        ? Math.round((Date.now() - participant.emailSentAt.getTime()) / 1000)
        : null;

      await prisma.campaignParticipant.updateMany({
        where: { campaignId, userId },
        data: { isLinkClicked: true, linkClickedAt: new Date(), timeToClick },
      });
    }
  },

  async verifyConnection(): Promise<boolean> {
    try {
      // Resend doesn't need a connection test — just verify API key exists
      if (!process.env.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY is not set');
        return false;
      }
      logger.info('Resend API key is configured');
      return true;
    } catch (err) {
      logger.error('Resend verification failed:', err);
      return false;
    }
  },
};