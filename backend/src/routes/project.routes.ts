import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller.ts';
import { authenticate } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema.ts';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:id', getProjectById);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

// Member management (Admin only)
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;
