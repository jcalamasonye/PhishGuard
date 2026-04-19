import { Router } from 'express';
import { emailController } from '@/controllers/email.controller';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';

const router = Router();

// Public tracking endpoints (no auth required - called from emails)
router.get('/track/open', emailController.trackOpen);
router.get('/track/click', emailController.trackClick);

// Admin endpoints
router.get('/verify-smtp', authenticate, requireAdmin, emailController.verifySmtp);

export default router;