import { Router } from "express";
import axios from "axios";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  "http://localhost:5000/api/github/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

router.get("/connect", authMiddleware, (req: AuthRequest, res) => {
  const state = req.userId;
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}` +
    `&scope=repo` +
    `&state=${state}`;

  res.json({ url: githubAuthUrl });
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  const userId = state as string;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      return res.redirect(`${FRONTEND_URL}/dashboard?github=error`);
    }

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        githubAccessToken: accessToken,
        githubUsername: userRes.data.login,
      },
    });

    res.redirect(`${FRONTEND_URL}/dashboard?github=connected`);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/dashboard?github=error`);
  }
});

router.get("/status", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { githubUsername: true },
  });

  res.json({
    connected: !!user?.githubUsername,
    username: user?.githubUsername,
  });
});

router.get("/repos", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { githubAccessToken: true },
    });

    if (!user?.githubAccessToken) {
      return res.status(400).json({ error: "GitHub account not connected" });
    }

    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` },
      params: { sort: "updated", per_page: 30 },
    });

    const repos = reposRes.data.map((r: any) => ({
      fullName: r.full_name,
      private: r.private,
      updatedAt: r.updated_at,
    }));

    res.json({ repos });
  } catch (error) {
    console.error("GitHub repos fetch error:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

router.post(
  "/projects/:projectId/link-repo",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.projectId as string;
      const { repo } = req.body;

      if (!repo) {
        return res.status(400).json({ error: "Repository is required" });
      }

      const project = await prisma.project.update({
        where: { id: projectId },
        data: { githubRepo: repo },
      });

      res.json({ project });
    } catch (error) {
      console.error("Link repo error:", error);
      res.status(500).json({ error: "Failed to link repository" });
    }
  },
);

router.get(
  "/projects/:projectId/activity",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.projectId as string },
      });

      if (!project?.githubRepo) {
        return res
          .status(404)
          .json({ error: "No repository linked to this project" });
      }

      const owner = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { githubAccessToken: true },
      });

      if (!owner?.githubAccessToken) {
        return res.status(400).json({ error: "GitHub account not connected" });
      }

      const headers = { Authorization: `Bearer ${owner.githubAccessToken}` };
      const base = `https://api.github.com/repos/${project.githubRepo}`;

      const [commitsRes, pullsRes, issuesRes] = await Promise.all([
        axios.get(`${base}/commits`, { headers, params: { per_page: 5 } }),
        axios.get(`${base}/pulls`, {
          headers,
          params: { state: "all", per_page: 5 },
        }),
        axios.get(`${base}/issues`, {
          headers,
          params: { state: "all", per_page: 5 },
        }),
      ]);

      res.json({
        commits: commitsRes.data.map((c: any) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author.name,
          date: c.commit.author.date,
        })),
        pulls: pullsRes.data.map((p: any) => ({
          number: p.number,
          title: p.title,
          state: p.state,
          url: p.html_url,
        })),
        issues: issuesRes.data
          .filter((i: any) => !i.pull_request)
          .map((i: any) => ({
            number: i.number,
            title: i.title,
            state: i.state,
            url: i.html_url,
          })),
      });
    } catch (error) {
      console.error("GitHub activity fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository activity" });
    }
  },
);

export default router;
