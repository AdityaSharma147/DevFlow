import prisma from "./prisma";

export async function createNotification(userId: string, message: string, link?: string) {
  return prisma.notification.create({
    data: { userId, message, link },
  });
}
