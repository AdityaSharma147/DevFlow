import request from "supertest";
import express from "express";
import cors from "cors";
import authRoutes from "./auth.routes";
import workspaceRoutes from "./workspace.routes";
import { resetDb } from "../test-utils/resetDb";
import prisma from "../lib/prisma";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);

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

describe("POST /api/workspaces", () => {
  it("creates a workspace and adds the creator as ADMIN", async () => {
    const token = await registerAndLogin("admin@example.com");

    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Workspace" });

    expect(res.status).toBe(201);
    expect(res.body.workspace.members).toHaveLength(1);
    expect(res.body.workspace.members[0].role).toBe("ADMIN");
  });

  it("rejects a request with no token", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .send({ name: "No Auth Workspace" });

    expect(res.status).toBe(401);
  });
});

describe("Workspace member invites — authorization", () => {
  it("allows an ADMIN to invite a member", async () => {
    const adminToken = await registerAndLogin("admin2@example.com");
    await registerAndLogin("invitee@example.com");

    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Invite Test Workspace" });

    const workspaceId = wsRes.body.workspace.id;

    const inviteRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "invitee@example.com" });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.member.role).toBe("DEVELOPER");
  });

  it("blocks a DEVELOPER from inviting a member", async () => {
    const adminToken = await registerAndLogin("admin3@example.com");
    const devToken = await registerAndLogin("developer@example.com");
    await registerAndLogin("thirdperson@example.com");

    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Permission Test Workspace" });

    const workspaceId = wsRes.body.workspace.id;

    // Admin invites the developer first, so they're a real member
    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "developer@example.com" });

    // Now the DEVELOPER tries to invite someone else — should fail
    const blockedRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${devToken}`)
      .send({ email: "thirdperson@example.com" });

    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.error).toBe(
      "Only workspace admins can invite members",
    );
  });

  it("blocks a non-member entirely from inviting", async () => {
    const adminToken = await registerAndLogin("admin4@example.com");
    const outsiderToken = await registerAndLogin("outsider@example.com");
    await registerAndLogin("target@example.com");

    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Outsider Test Workspace" });

    const workspaceId = wsRes.body.workspace.id;

    const res = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ email: "target@example.com" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("You are not a member of this workspace");
  });
});
