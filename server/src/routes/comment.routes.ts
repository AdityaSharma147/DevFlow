import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { getWorkspaceRole } from "../lib/permissions";
import { createNotification } from "../lib/notifications";

const router = Router();

async function getTaskRole(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task) return null;
  return getWorkspaceRole(userId, task.project.workspaceId);
}

router.post(
  "/tasks/:taskId/comments",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const taskId = req.params.taskId as string;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      const role = await getTaskRole(req.userId as string, taskId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this task" });
      }
      if (role === "VIEWER") {
        return res.status(403).json({ error: "Viewers cannot comment" });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          taskId,
          authorId: req.userId as string,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
      const task = await prisma.task.findUnique({ where: { id: taskId } });

      if (task?.assigneeId && task.assigneeId !== req.userId) {
        await createNotification(
          task.assigneeId,
          `${comment.author.name} commented on "${task.title}"`,
          `/projects/${task.projectId}`,
        );
      }
      res.status(201).json({ comment });
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.get(
  "/tasks/:taskId/comments",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const taskId = req.params.taskId as string;

      const role = await getTaskRole(req.userId as string, taskId);
      if (!role) {
        return res
          .status(403)
          .json({ error: "You do not have access to this task" });
      }

      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      res.json({ comments });
    } catch (error) {
      console.error("List comments error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.delete(
  "/comments/:commentId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const commentId = req.params.commentId as string;

      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const role = await getTaskRole(req.userId as string, comment.taskId);
      const isAuthor = comment.authorId === req.userId;
      const canModerate = role === "ADMIN" || role === "MANAGER";

      if (!isAuthor && !canModerate) {
        return res
          .status(403)
          .json({ error: "You can only delete your own comments" });
      }

      await prisma.comment.delete({ where: { id: commentId } });

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

export default router;
