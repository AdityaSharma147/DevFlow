import request from "supertest";
import express from "express";
import cors from "cors";
import authRoutes from "./auth.routes";
import { resetDb } from "../test-utils/resetDb";
import prisma from "../lib/prisma";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("creates a new user with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "First User",
      email: "duplicate@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "duplicate@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "short@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
  });
});
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test User",
      email: "logintest@example.com",
      password: "password123",
    });
  });

  it("logs in with correct credentials and returns a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "logintest@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("logintest@example.com");
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "logintest@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("rejects a login for a nonexistent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});
