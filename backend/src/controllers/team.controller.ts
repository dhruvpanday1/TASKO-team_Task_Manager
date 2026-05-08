import type { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';
import type { AuthRequest } from '../middleware/auth.ts';

// GET /api/team — all unique members across user's projects
export const getTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all projects user is a member of
    const userMemberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });

    const projectIds = userMemberships.map(m => m.projectId);

    if (projectIds.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    // Get all members across those projects (with project info)
    const memberships = await prisma.projectMember.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true }
        },
        project: {
          select: { id: true, title: true }
        }
      }
    });

    // Deduplicate users, group their projects
    const memberMap = new Map<string, {
      id: string; name: string | null; email: string; avatar: string | null;
      role: string; createdAt: Date; projects: { id: string; title: string; memberRole: string }[];
    }>();

    for (const m of memberships) {
      const existing = memberMap.get(m.userId);
      if (existing) {
        existing.projects.push({ id: m.project.id, title: m.project.title, memberRole: m.role });
      } else {
        memberMap.set(m.userId, {
          ...m.user,
          projects: [{ id: m.project.id, title: m.project.title, memberRole: m.role }]
        });
      }
    }

    const members = Array.from(memberMap.values());
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};
