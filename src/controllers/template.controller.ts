import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { templateService } from '../services/template.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export const templateController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { templates, total, page, limit } = await templateService.getAll({
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      organizationId: req.user?.organizationId,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    sendPaginated(res, templates, page, limit, total);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await templateService.getById(req.params['id'] as string);
    sendSuccess(res, template);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await templateService.create({
      ...req.body,
      organizationId: req.user?.organizationId,
    });
    sendCreated(res, template, 'Template created successfully');
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await templateService.update(req.params['id'] as string, req.body);
    sendSuccess(res, template, 'Template updated successfully');
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await templateService.delete(req.params['id'] as string);
    sendNoContent(res);
  }),

  duplicate: asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await templateService.duplicate(req.params['id'] as string, req.user?.organizationId);
    sendCreated(res, template, 'Template duplicated successfully');
  }),
};