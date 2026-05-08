import { Router } from 'express';
import {
  getMyTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
} from '../controllers/task.controller.ts';
import { authenticate } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.ts';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/', getMyTasks);
router.get('/project/:projectId', getTasksByProject);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
