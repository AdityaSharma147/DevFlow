import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const query = (req.query.q as string) || "";

    if (!query.trim() || query.trim().length < 2) {
      return res.json({ projects: [], tasks: [] });
    }

    const userId = req.userId as string;

    const myWorkspaceIds = (
      await prisma.workspaceMember.findMany({
        where: { userId },
        select: { workspaceId: true },
      })
    ).map((m) => m.workspaceId);

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: { in: myWorkspaceIds },
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true, workspaceId: true },
      take: 5,
    });

    const tasks = await prisma.task.findMany({
      where: {
        project: { workspaceId: { in: myWorkspaceIds } },
        title: { contains: query, mode: "insensitive" },
      },
      select: { id: true, title: true, projectId: true },
      take: 5,
    });

    res.json({ projects, tasks });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
