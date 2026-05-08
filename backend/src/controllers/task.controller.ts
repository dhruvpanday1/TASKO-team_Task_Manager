import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

// Helper: parse tags from JSON string (SQLite stores as string)
const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags as string[];
  if (typeof tags === 'string') {
    try { return JSON.parse(tags); } catch { return []; }
  }
  return [];
};

// Helper: serialize tags to JSON string for SQLite
const serializeTags = (tags: unknown): string => {
  if (Array.isArray(tags)) return JSON.stringify(tags);
  if (typeof tags === 'string') return tags;
  return '[]';
};

// Helper: enrich task with parsed tags
const enrichTask = (task: any) => ({
  ...task,
  tags: parseTags(task.tags),
});

// GET /api/tasks — get all tasks assigned to current user
export const getMyTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const statusQuery = req.query['status'];
    const status = typeof statusQuery === 'string' ? statusQuery : undefined;

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        ...(status ? { status } : {})
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tasks.map(enrichTask) });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/project/:projectId — get all tasks for a project
export const getTasksByProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['projectId'] as string;
    const userId = req.user!.id;

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!isMember) {
      res.status(403).json({ success: false, error: 'Not authorized to view tasks for this project' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tasks.map(enrichTask) });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks — create a task
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, dueDate, priority, tags, assigneeId, projectId } = req.body;
    const userId = req.user!.id;

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!isMember) {
      res.status(403).json({ success: false, error: 'Not authorized to create tasks in this project' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title: title as string,
        description: description as string | undefined,
        dueDate: dueDate ? new Date(dueDate as string) : undefined,
        priority: (priority as string) || 'MEDIUM',
        tags: serializeTags(tags),
        projectId: projectId as string,
        // Auto-assign to creator if no assigneeId provided
        assigneeId: (assigneeId as string) || userId,
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json({ success: true, data: enrichTask(task) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id — update a task
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } }
    });

    if (!isMember) {
      res.status(403).json({ success: false, error: 'Not authorized to update this task' });
      return;
    }

    const { title, description, dueDate, priority, tags, assigneeId, status } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title ? { title: title as string } : {}),
        ...(description !== undefined ? { description: description as string } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate as string) : undefined } : {}),
        ...(priority ? { priority: priority as string } : {}),
        ...(tags !== undefined ? { tags: serializeTags(tags) } : {}),
        ...(assigneeId !== undefined ? { assigneeId: (assigneeId as string) || undefined } : {}),
        ...(status ? { status: status as string } : {}),
      },
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } }
      }
    });

    res.status(200).json({ success: true, data: enrichTask(updatedTask) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id — delete a task
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } }
    });

    if (!membership) {
      res.status(403).json({ success: false, error: 'Not authorized to delete this task' });
      return;
    }

    if (membership.role !== 'ADMIN' && task.assigneeId !== userId) {
      res.status(403).json({ success: false, error: 'Only project admins or task assignees can delete tasks' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/stats — dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // Get all projects user is in
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });
    const projectIds = memberships.map(m => m.projectId);

    const [total, completed, inProgress, review, overdue] = await Promise.all([
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'REVIEW' } }),
      prisma.task.count({
        where: { assigneeId: userId, dueDate: { lt: now }, status: { not: 'COMPLETED' } }
      }),
    ]);

    const projectCount = projectIds.length;

    // Tasks per user (across all projects user is in)
    let tasksPerUser: { name: string; total: number; completed: number }[] = [];
    if (projectIds.length > 0) {
      const tasksByAssignee = await prisma.task.groupBy({
        by: ['assigneeId'],
        where: { projectId: { in: projectIds }, assigneeId: { not: null } },
        _count: { id: true },
      });

      const completedByAssignee = await prisma.task.groupBy({
        by: ['assigneeId'],
        where: { projectId: { in: projectIds }, assigneeId: { not: null }, status: 'COMPLETED' },
        _count: { id: true },
      });

      const completedMap = new Map(completedByAssignee.map(r => [r.assigneeId, r._count.id]));

      const userIds = tasksByAssignee.map(r => r.assigneeId!).filter(Boolean);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
      });
      const userMap = new Map(users.map(u => [u.id, u.name || u.email]));

      tasksPerUser = tasksByAssignee.map(r => ({
        name: userMap.get(r.assigneeId!) || 'Unknown',
        total: r._count.id,
        completed: completedMap.get(r.assigneeId!) || 0,
      })).sort((a, b) => b.total - a.total);
    }

    res.status(200).json({
      success: true,
      data: { total, completed, inProgress, review, overdue, projectCount, tasksPerUser }
    });
  } catch (error) {
    next(error);
  }
};
