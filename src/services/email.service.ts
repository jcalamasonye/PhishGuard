import nodemailer from 'nodemailer';
import { config } from '@/config';
import prisma from '@/utils/database';
import logger from '@/utils/logger';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

function buildTrackingPixelUrl(campaignId: string, userId: string): string {
  // Pixel must hit the BACKEND so the server can record the open event
  return `${config.BACKEND_URL}/api/${config.API_VERSION}/email/track/open?cid=${campaignId}&uid=${userId}`;
}

function buildTrackingLinkUrl(campaignId: string, userId: string): string {
  // Click goes to BACKEND which records it, then redirects to FRONTEND training page
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

  let body = template.body.replace(/\{\{user_name\}\}/g, userName);

  const ctaButton = template.ctaText
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${trackingLink}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
          ${template.ctaText}
        </a>
      </div>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="white-space:pre-wrap;line-height:1.6;color:#333333;font-size:14px;">
        ${body}
      </div>
      ${ctaButton}
      <img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />
    </div>
  `;
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
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        organization: {
          select: {
            fromEmail: true,
            fromName: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const fromEmail = campaign.organization?.fromEmail || config.FROM_EMAIL;
    const fromName = campaign.template.fromName || campaign.organization?.fromName || config.FROM_NAME;

    let sentCount = 0;
    let failedCount = 0;

    for (const participant of campaign.participants) {
      try {
        const htmlBody = renderEmailBody(
          campaign.template,
          participant.user.name,
          campaignId,
          participant.user.id
        );

        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: participant.user.email,
          subject: campaign.template.subject,
          html: htmlBody,
        });

        await prisma.emailEvent.create({
          data: {
            eventType: 'sent',
            campaignId,
            userId: participant.user.id,
          },
        });

        sentCount++;
        logger.info(`Email sent to ${participant.user.email} for campaign ${campaignId}`);
      } catch (err) {
        failedCount++;
        logger.error(`Failed to send email to ${participant.user.email}: ${err}`);
      }
    }

    return { sentCount, failedCount, total: campaign.participants.length };
  },

  async recordOpen(campaignId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await prisma.emailEvent.create({
      data: {
        eventType: 'opened',
        campaignId,
        userId,
        ipAddress,
        userAgent,
      },
    });

    await prisma.campaignParticipant.updateMany({
      where: { campaignId, userId, isEmailOpened: false },
      data: {
        isEmailOpened: true,
        emailOpenedAt: new Date(),
      },
    });
  },

  async recordClick(campaignId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await prisma.emailEvent.create({
      data: {
        eventType: 'clicked',
        campaignId,
        userId,
        ipAddress,
        userAgent,
      },
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
        data: {
          isLinkClicked: true,
          linkClickedAt: new Date(),
          timeToClick,
        },
      });
    }
  },

  async verifyConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  },
};