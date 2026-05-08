import { Router } from 'express';
import { getTeamMembers } from '../controllers/team.controller.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);
router.get('/', getTeamMembers);

export default router;
