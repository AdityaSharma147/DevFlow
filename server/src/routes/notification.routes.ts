import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.patch(
  "/:notificationId/read",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const notificationId = req.params.notificationId as string;

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });
      if (!notification || notification.userId !== req.userId) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      res.json({ notification: updated });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
);

router.patch("/read-all", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
