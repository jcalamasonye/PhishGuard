import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, bulkUploadUsersSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', requireAdmin, userController.getAll);
router.post('/', requireAdmin, validateBody(createUserSchema), userController.create);
router.post('/bulk-upload', requireAdmin, validateBody(bulkUploadUsersSchema), userController.bulkCreate);
router.get('/:id', userController.getById);
router.patch('/:id', validateBody(updateUserSchema), userController.update);
router.delete('/:id', requireAdmin, userController.delete);
router.get('/:id/performance', userController.getPerformance);

export default router;
