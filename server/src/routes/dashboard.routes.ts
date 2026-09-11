import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId as string;

    // How many workspaces am I in?
    const workspaceCount = await prisma.workspaceMember.count({
      where: { userId },
    });

    // Tasks assigned to me, grouped by status
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const tasksByStatus = {
      TODO: myTasks.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: myTasks.filter((t) => t.status === "IN_PROGRESS").length,
      REVIEW: myTasks.filter((t) => t.status === "REVIEW").length,
      DONE: myTasks.filter((t) => t.status === "DONE").length,
    };

    // My 5 most urgent/soonest tasks that aren't done yet
    const upcomingTasks = myTasks
      .filter((t) => t.status !== "DONE")
      .slice(0, 5);

    res.json({
      workspaceCount,
      taskCount: myTasks.length,
      tasksByStatus,
      upcomingTasks,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
