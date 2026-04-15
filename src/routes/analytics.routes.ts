import { Router } from 'express';
import { analyticsController } from '@/controllers/analytics.controller';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/overview', analyticsController.getOverview);
router.get('/department', analyticsController.getDepartmentStats);
router.get('/risk-assessment', analyticsController.getRiskAssessment);
router.get('/trend', analyticsController.getClickRateTrend);
router.get('/template-performance', analyticsController.getTemplatePerformance);

export default router;