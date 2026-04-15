import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createCampaignSchema, updateCampaignSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', campaignController.getAll);
router.post('/', requireAdmin, validateBody(createCampaignSchema), campaignController.create);
router.get('/:id', campaignController.getById);
router.patch('/:id', requireAdmin, validateBody(updateCampaignSchema), campaignController.update);
router.delete('/:id', requireAdmin, campaignController.delete);
router.post('/:id/launch', requireAdmin, campaignController.launch);
router.get('/:id/results', requireAdmin, campaignController.getResults);

export default router;
