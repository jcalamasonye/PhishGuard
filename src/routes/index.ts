import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import campaignRoutes from './campaign.routes';
import templateRoutes from './template.routes';
import quizRoutes from './quiz.routes';
import analyticsRoutes from './analytics.routes';
import aiRoutes from './ai.routes';
import emailRoutes from './email.routes';
import organizationRoutes from './organization.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/templates', templateRoutes);
router.use('/quizzes', quizRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/email', emailRoutes);
router.use('/organization', organizationRoutes);

export default router;