import { Router } from 'express';
import { organizationController } from '@/controllers/organization.controller';
import { authenticate, requireAdmin } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', organizationController.get);
router.patch('/', organizationController.update);

export default router;