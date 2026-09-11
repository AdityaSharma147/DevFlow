import { Router } from "express";
import Groq from "groq-sdk";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { getWorkspaceRole } from "../lib/permissions";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post(
  "/projects/:projectId/generate-tasks",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;
      const { goal } = req.body;

      if (!goal || !goal.trim()) {
        return res
          .status(400)
          .json({ error: "A goal description is required" });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const role = await getWorkspaceRole(
        req.userId as string,
        project.workspaceId,
      );
      if (!role || role === "VIEWER") {
        return res
          .status(403)
          .json({ error: "You do not have permission to generate tasks here" });
      }

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "You are a project planning assistant. Given a goal, break it into 4-8 concrete, actionable software development tasks. " +
              "Respond ONLY with valid JSON, no markdown formatting, no explanation. " +
              'Format: {"tasks": [{"title": "...", "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"}]}',
          },
          {
            role: "user",
            content: `Goal: ${goal}`,
          },
        ],
        temperature: 0.4,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);

      res.json({ tasks: parsed.tasks || [] });
    } catch (error) {
      console.error("AI task generation error:", error);
      res
        .status(500)
        .json({ error: "Failed to generate tasks. Please try again." });
    }
  },
);

export default router;
