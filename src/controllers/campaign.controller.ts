import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { campaignService } from '../services/campaign.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

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
    const campaign = await campaignService.getById(req.params.id);
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
    const campaign = await campaignService.update(req.params.id, req.body);
    sendSuccess(res, campaign, 'Campaign updated successfully');
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await campaignService.delete(req.params.id);
    sendNoContent(res);
  }),

  launch: asyncHandler(async (req: AuthRequest, res: Response) => {
    const campaign = await campaignService.launch(req.params.id);
    sendSuccess(res, campaign, 'Campaign launched successfully');
  }),

  getResults: asyncHandler(async (req: AuthRequest, res: Response) => {
    const results = await campaignService.getResults(req.params.id);
    sendSuccess(res, results);
  }),
};
