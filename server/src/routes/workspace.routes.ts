import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { createNotification } from "../lib/notifications";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Workspace name is required" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        ownerId: req.userId as string,
        members: {
          create: {
            userId: req.userId as string,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json({ workspace });
  } catch (error) {
    console.error("Create workspace error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    res.json({ workspaces });
  } catch (error) {
    console.error("Get workspaces error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post(
  "/:workspaceId/members",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const requesterMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.userId as string,
            workspaceId,
          },
        },
      });

      if (!requesterMembership) {
        return res
          .status(403)
          .json({ error: "You are not a member of this workspace" });
      }

      if (requesterMembership.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Only workspace admins can invite members" });
      }

      const invitedUser = await prisma.user.findUnique({ where: { email } });

      if (!invitedUser) {
        return res
          .status(404)
          .json({ error: "No DevFlow account found with that email" });
      }

      const existingMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: invitedUser.id,
            workspaceId,
          },
        },
      });

      if (existingMembership) {
        return res
          .status(409)
          .json({ error: "This user is already a member of the workspace" });
      }

      const newMember = await prisma.workspaceMember.create({
        data: {
          userId: invitedUser.id,
          workspaceId,
          role: role || "DEVELOPER",
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      await createNotification(
        invitedUser.id,
        `You were added to the workspace "${workspace?.name}"`,
        `/workspaces/${workspaceId}`,
      );
      res.status(201).json({ member: newMember });
    } catch (error) {
      console.error("Invite member error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.patch(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const memberId = req.params.memberId as string;
      const { role } = req.body;

      const validRoles = ["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const requesterMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId: req.userId as string, workspaceId },
        },
      });

      if (!requesterMembership || requesterMembership.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Only workspace admins can change roles" });
      }
      const targetMember = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
      });

      if (targetMember?.role === "ADMIN" && role !== "ADMIN") {
        const adminCount = await prisma.workspaceMember.count({
          where: { workspaceId, role: "ADMIN" },
        });

        if (adminCount <= 1) {
          return res.status(400).json({
            error: "Cannot demote the only admin. Promote someone else first.",
          });
        }
      }
      const updatedMember = await prisma.workspaceMember.update({
        where: { id: memberId },
        data: { role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      res.json({ member: updatedMember });
    } catch (error) {
      console.error("Update member role error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.delete(
  "/:workspaceId/members/:memberId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const memberId = req.params.memberId as string;

      const requesterMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId: req.userId as string, workspaceId },
        },
      });

      if (!requesterMembership || requesterMembership.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Only workspace admins can remove members" });
      }

      const memberToRemove = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
      });

      if (!memberToRemove) {
        return res.status(404).json({ error: "Member not found" });
      }

      if (memberToRemove.role === "ADMIN") {
        const adminCount = await prisma.workspaceMember.count({
          where: { workspaceId, role: "ADMIN" },
        });

        if (adminCount <= 1) {
          return res.status(400).json({
            error: "Cannot remove the only admin. Promote someone else first.",
          });
        }
      }

      await prisma.workspaceMember.delete({ where: { id: memberId } });

      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

export default router;
