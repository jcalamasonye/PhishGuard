import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { quizService } from '../services/quiz.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export const quizController = {
  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { quizzes, total, page, limit } = await quizService.getAll({
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    sendPaginated(res, quizzes, page, limit, total);
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const quiz = await quizService.getById(req.params.id);
    sendSuccess(res, quiz);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const quiz = await quizService.create(req.body);
    sendCreated(res, quiz, 'Quiz created successfully');
  }),

  submit: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await quizService.submitQuiz(req.params.id, req.user!.id, req.body);
    sendSuccess(res, result, 'Quiz submitted successfully');
  }),

  getAttempts: asyncHandler(async (req: AuthRequest, res: Response) => {
    const attempts = await quizService.getAttempts(req.user!.id);
    sendSuccess(res, attempts);
  }),

  getAttemptById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const attempt = await quizService.getAttemptById(req.params.id);
    sendSuccess(res, attempt);
  }),
};
