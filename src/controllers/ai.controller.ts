import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { aiService } from '@/services/ai.service';
import { sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/middleware/error.middleware';

export const aiController = {
  analyze: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { emailText } = req.body;

    if (!emailText || typeof emailText !== 'string' || emailText.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'emailText is required' },
      });
      return;
    }

    const result = await aiService.analyzeEmail(emailText.trim());
    sendSuccess(res, result, 'Email analyzed successfully');
  }),

  batchAnalyze: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'emails array is required' },
      });
      return;
    }

    if (emails.length > 100) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Maximum 100 emails per batch' },
      });
      return;
    }

    const results = await aiService.batchAnalyze(emails);
    sendSuccess(res, results, 'Batch analysis complete');
  }),

  health: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const health = await aiService.checkHealth();
    sendSuccess(res, health, 'AI service health status');
  }),
};