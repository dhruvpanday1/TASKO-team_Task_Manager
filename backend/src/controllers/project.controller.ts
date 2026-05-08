import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, deadline, priority } = req.body;
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || 'MEDIUM',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          }
        }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true, members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } }
    });

    if (!isMember) {
      res.status(403).json({ success: false, error: 'Not authorized to view this project' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            _count: { select: { comments: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        owner: { select: { id: true, name: true, avatar: true } }
      }
    });

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Not authorized to update this project' });
      return;
    }

    const { title, description, deadline, priority, status, progress } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title ? { title: title as string } : {}),
        ...(description !== undefined ? { description: description as string } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline as string) : undefined } : {}),
        ...(priority ? { priority: priority as string } : {}),
        ...(status ? { status: status as string } : {}),
        ...(progress !== undefined ? { progress: progress as number } : {}),
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    if (project.ownerId !== userId) {
      res.status(403).json({ success: false, error: 'Only the project owner can delete it' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:id/members — Admin adds a member by email
export const addMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['id'] as string;
    const userId = req.user!.id;
    const { email, role } = req.body;

    // Must be admin
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!membership || membership.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Only project admins can add members' });
      return;
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'No user found with that email address' });
      return;
    }

    // Check already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUser.id } }
    });
    if (existing) {
      res.status(400).json({ success: false, error: 'User is already a member of this project' });
      return;
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id/members/:memberId — Admin removes a member
export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params['id'] as string;
    const memberId = req.params['memberId'] as string;
    const userId = req.user!.id;

    // Must be admin
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!membership || membership.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Only project admins can remove members' });
      return;
    }

    // Cannot remove project owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project?.ownerId === memberId) {
      res.status(400).json({ success: false, error: 'Cannot remove the project owner' });
      return;
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberId } }
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
