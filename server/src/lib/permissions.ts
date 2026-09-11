import prisma from "./prisma";

export async function getWorkspaceRole(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return membership?.role ?? null;
}

export function canManageProjects(role: string | null) {
  return role === "ADMIN" || role === "MANAGER";
}
