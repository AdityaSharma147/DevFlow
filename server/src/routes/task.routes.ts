import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { getWorkspaceRole } from "../lib/permissions";

const router = Router();

async function getProjectRole(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  return getWorkspaceRole(userId, project.workspaceId);
}

router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;
      const { title, description, priority, dueDate, labels, assigneeId } =
        req.body;

      if (!title) {
        return res.status(400).json({ error: "Task title is required" });
      }

      const role = await getProjectRole(req.userId as string, projectId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this project" });
      }
      if (role === "VIEWER") {
        return res.status(403).json({ error: "Viewers cannot create tasks" });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority: priority || "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
          labels: labels || [],
          projectId,
          assigneeId: assigneeId || null,
          createdById: req.userId as string,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json({ task });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;

      const role = await getProjectRole(req.userId as string, projectId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this project" });
      }

      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ tasks });
    } catch (error) {
      console.error("List tasks error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.patch(
  "/tasks/:taskId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const taskId = req.params.taskId as string;
      const {
        title,
        description,
        status,
        priority,
        dueDate,
        labels,
        assigneeId,
      } = req.body;

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const role = await getProjectRole(req.userId as string, task.projectId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this project" });
      }
      if (role === "VIEWER") {
        return res.status(403).json({ error: "Viewers cannot edit tasks" });
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
          ...(labels !== undefined && { labels }),
          ...(assigneeId !== undefined && { assigneeId }),
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      res.json({ task: updated });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.delete(
  "/tasks/:taskId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const taskId = req.params.taskId as string;

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const role = await getProjectRole(req.userId as string, task.projectId);
      if (role !== "ADMIN" && role !== "MANAGER") {
        return res
          .status(403)
          .json({ error: "Only admins and managers can delete tasks" });
      }

      await prisma.task.delete({ where: { id: taskId } });

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

export default router;
