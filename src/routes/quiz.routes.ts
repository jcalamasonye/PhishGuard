import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createQuizSchema, submitQuizSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', quizController.getAll);
router.post('/', requireAdmin, validateBody(createQuizSchema), quizController.create);
router.get('/attempts', quizController.getAttempts);
router.get('/attempts/:id', quizController.getAttemptById);
router.get('/:id', quizController.getById);
router.post('/:id/submit', validateBody(submitQuizSchema), quizController.submit);

export default router;
