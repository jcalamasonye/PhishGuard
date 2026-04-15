import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createTemplateSchema, updateTemplateSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', templateController.getAll);
router.post('/', requireAdmin, validateBody(createTemplateSchema), templateController.create);
router.get('/:id', templateController.getById);
router.patch('/:id', requireAdmin, validateBody(updateTemplateSchema), templateController.update);
router.delete('/:id', requireAdmin, templateController.delete);
router.post('/:id/duplicate', requireAdmin, templateController.duplicate);

export default router;
