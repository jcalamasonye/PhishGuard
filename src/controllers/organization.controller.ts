import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import prisma from '@/utils/database';
import { sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/middleware/error.middleware';

export const organizationController = {
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.organizationId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No organization found' },
      });
      return;
    }

    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
    });

    sendSuccess(res, org);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.organizationId) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No organization found' },
      });
      return;
    }

    const { name, logo, primaryColor, secondaryColor, fromEmail, fromName } = req.body;

    const org = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: {
        ...(name && { name }),
        ...(logo && { logo }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(fromEmail && { fromEmail }),
        ...(fromName && { fromName }),
      },
    });

    sendSuccess(res, org, 'Organization updated successfully');
  }),
};