import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { campaignService } from '../services/campaign.service';
import { emailService } from '../services/email.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';
import logger from '../utils/logger';

export const campaignController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { campaigns, total, page, limit } = await campaignService.getAll({
      status: req.query.status as string,
      search: req.query.search as string,
      organizationId: req.user?.organizationId,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    sendPaginated(res, campaigns, page, limit, total);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const campaign = await campaignService.getById(req.params['id'] as string);
    sendSuccess(res, campaign);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const campaign = await campaignService.create({
      ...req.body,
      organizationId: req.user!.organizationId!,
    });
    sendCreated(res, campaign, 'Campaign created successfully');
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const campaign = await campaignService.update(req.params['id'] as string, req.body);
    sendSuccess(res, campaign, 'Campaign updated successfully');
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await campaignService.delete(req.params['id'] as string);
    sendNoContent(res);
  }),

  launch: asyncHandler(async (req: AuthRequest, res: Response) => {
    const campaignId = req.params['id'] as string;

    // Mark campaign as active and participants as sent
    const campaign = await campaignService.launch(campaignId);

    // Send phishing emails to all participants (non-blocking — respond immediately)
    emailService.sendCampaignEmails(campaignId)
      .then(({ sentCount, failedCount, total }) => {
        logger.info(`Campaign ${campaignId} emails: ${sentCount}/${total} sent, ${failedCount} failed`);
      })
      .catch((err) => {
        logger.error(`Campaign ${campaignId} email sending error:`, err);
      });

    sendSuccess(res, campaign, `Campaign launched successfully. Emails are being sent to all participants.`);
  }),

  getResults: asyncHandler(async (req: AuthRequest, res: Response) => {
    const results = await campaignService.getResults(req.params['id'] as string);
    sendSuccess(res, results);
  }),
};