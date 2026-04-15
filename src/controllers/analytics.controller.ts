import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { analyticsService } from '@/services/analytics.service';
import { sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/middleware/error.middleware';

export const analyticsController = {
  getOverview: asyncHandler(async (req: AuthRequest, res: Response) => {
    const overview = await analyticsService.getOverview(req.user?.organizationId);
    sendSuccess(res, overview);
  }),

  getDepartmentStats: asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await analyticsService.getDepartmentStats(req.user?.organizationId);
    sendSuccess(res, stats);
  }),

  getRiskAssessment: asyncHandler(async (req: AuthRequest, res: Response) => {
    const assessment = await analyticsService.getRiskAssessment(req.user?.organizationId);
    sendSuccess(res, assessment);
  }),

  getClickRateTrend: asyncHandler(async (req: AuthRequest, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const trend = await analyticsService.getClickRateTrend(req.user?.organizationId, days);
    sendSuccess(res, trend);
  }),

  getTemplatePerformance: asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await analyticsService.getTemplatePerformance(req.user?.organizationId);
    sendSuccess(res, data);
  }),
};