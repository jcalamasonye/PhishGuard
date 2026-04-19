import { Router } from 'express';
import { aiController } from '@/controllers/ai.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', aiController.analyze);
router.post('/batch-analyze', aiController.batchAnalyze);
router.get('/health', aiController.health);

export default router;