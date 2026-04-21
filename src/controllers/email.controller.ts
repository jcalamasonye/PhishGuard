import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { emailService } from '@/services/email.service';
import { sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/middleware/error.middleware';

export const emailController = {
  trackOpen: async (req: Request, res: Response) => {
    const { cid, uid } = req.query;

    if (typeof cid === 'string' && typeof uid === 'string') {
      try {
        await emailService.recordOpen(cid, uid, req.ip, req.get('user-agent'));
      } catch {

      }
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    });
    res.end(pixel);
  },

  trackClick: async (req: Request, res: Response) => {
    const { cid, uid } = req.query;

    if (typeof cid === 'string' && typeof uid === 'string') {
      try {
        await emailService.recordClick(cid, uid, req.ip, req.get('user-agent'));
      } catch {
        // Never block the redirect on a tracking error
      }
    }

    // Redirect to the frontend training page — this is the "caught" moment
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trainingUrl = `${frontendUrl}/training/${cid}?uid=${uid}`;
    res.redirect(302, trainingUrl);
  },

  verifySmtp: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const isConnected = await emailService.verifyConnection();
    sendSuccess(res, { connected: isConnected }, isConnected ? 'SMTP connection verified' : 'SMTP connection failed');
  }),
};