import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { getWorkspaceRole, canManageProjects } from "../lib/permissions";

const router = Router();

router.post(
  "/workspaces/:workspaceId/projects",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Project name is required" });
      }

      const role = await getWorkspaceRole(req.userId as string, workspaceId);

      if (!role) {
        return res
          .status(403)
          .json({ error: "You are not a member of this workspace" });
      }

      if (!canManageProjects(role)) {
        return res
          .status(403)
          .json({ error: "Only admins and managers can create projects" });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          workspaceId,
          createdById: req.userId as string,
          members: {
            create: { userId: req.userId as string, role: "ADMIN" },
          },
        },
        include: { members: true },
      });

      res.status(201).json({ project });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.get(
  "/workspaces/:workspaceId/projects",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;

      const role = await getWorkspaceRole(req.userId as string, workspaceId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You are not a member of this workspace" });
      }

      const projects = await prisma.project.findMany({
        where: { workspaceId },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          tasks: { select: { status: true } },
        },
      });

      res.json({ projects });
    } catch (error) {
      console.error("List projects error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.patch(
  "/projects/:projectId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;
      const { name, description } = req.body;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const role = await getWorkspaceRole(
        req.userId as string,
        project.workspaceId,
      );
      if (!canManageProjects(role)) {
        return res
          .status(403)
          .json({ error: "Only admins and managers can edit projects" });
      }

      const updated = await prisma.project.update({
        where: { id: projectId },
        data: { name, description },
      });

      res.json({ project: updated });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.delete(
  "/projects/:projectId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const role = await getWorkspaceRole(
        req.userId as string,
        project.workspaceId,
      );
      if (!canManageProjects(role)) {
        return res
          .status(403)
          .json({ error: "Only admins and managers can delete projects" });
      }

      await prisma.project.delete({ where: { id: projectId } });

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.get(
  "/projects/:projectId/members",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const role = await getWorkspaceRole(
        req.userId as string,
        project.workspaceId,
      );
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this project" });
      }

      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: project.workspaceId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      res.json({ members });
    } catch (error) {
      console.error("Get project members error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);
export default router;
