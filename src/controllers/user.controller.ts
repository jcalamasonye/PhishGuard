import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export const userController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { users, total, page, limit } = await userService.getAll({
      search: req.query.search as string,
      department: req.query.department as string,
      role: req.query.role as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    sendPaginated(res, users, page, limit, total);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getById(req.params.id);
    sendSuccess(res, user);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.create({
      ...req.body,
      organizationId: req.user?.organizationId,
    });
    sendCreated(res, user, 'User created successfully');
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    sendSuccess(res, user, 'User updated successfully');
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await userService.delete(req.params.id);
    sendNoContent(res);
  }),

  bulkCreate: asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await userService.bulkCreate(req.body.users, req.user?.organizationId);
    sendCreated(res, { count: users.length, users }, 'Users created successfully');
  }),

  getPerformance: asyncHandler(async (req: AuthRequest, res: Response) => {
    const performance = await userService.getPerformance(req.params.id);
    sendSuccess(res, performance);
  }),
};
