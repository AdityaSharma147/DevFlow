import request from "supertest";
import express from "express";
import cors from "cors";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import { resetDb } from "../test-utils/resetDb";
import prisma from "../lib/prisma";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

async function registerAndLogin(email: string) {
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "password123",
  });
  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "password123",
  });
  return res.body.token as string;
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Task creation — authorization", () => {
  async function setupWorkspaceAndProject(adminToken: string) {
    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Task Test Workspace" });

    const workspaceId = wsRes.body.workspace.id;

    const projRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/projects`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Task Test Project" });

    return { workspaceId, projectId: projRes.body.project.id };
  }

  it("allows a DEVELOPER to create a task", async () => {
    const adminToken = await registerAndLogin("admin@example.com");
    const devToken = await registerAndLogin("dev@example.com");
    const { workspaceId, projectId } =
      await setupWorkspaceAndProject(adminToken);

    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "dev@example.com", role: "DEVELOPER" });

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ title: "A real task" });

    expect(res.status).toBe(201);
    expect(res.body.task.status).toBe("TODO");
  });

  it("blocks a VIEWER from creating a task", async () => {
    const adminToken = await registerAndLogin("admin2@example.com");
    const viewerToken = await registerAndLogin("viewer@example.com");
    const { workspaceId, projectId } =
      await setupWorkspaceAndProject(adminToken);

    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "viewer@example.com", role: "VIEWER" });

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ title: "Should not be created" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Viewers cannot create tasks");
  });

  it("rejects task creation with no title", async () => {
    const adminToken = await registerAndLogin("admin3@example.com");
    const { projectId } = await setupWorkspaceAndProject(adminToken);

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tasks/:taskId — partial updates", () => {
  it("updates only the provided field, leaving others untouched", async () => {
    const adminToken = await registerAndLogin("admin4@example.com");
    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Patch Test Workspace" });

    const projRes = await request(app)
      .post(`/api/workspaces/${wsRes.body.workspace.id}/projects`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Patch Test Project" });

    const taskRes = await request(app)
      .post(`/api/projects/${projRes.body.project.id}/tasks`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Original Title", priority: "HIGH" });

    const taskId = taskRes.body.task.id;

    const patchRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.task.status).toBe("IN_PROGRESS");
    expect(patchRes.body.task.title).toBe("Original Title");
    expect(patchRes.body.task.priority).toBe("HIGH");
  });
});
