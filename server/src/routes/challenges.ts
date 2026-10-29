import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { reviewChallenge } from "../lib/srs.js";
import { body, HttpError } from "../lib/validate.js";

export const challengesRouter = Router();

// List all challenges with your progress on each.
challengesRouter.get("/", async (_req, res) => {
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ level: "asc" }, { id: "asc" }],
    include: { attempts: { select: { passed: true, total: true } } },
  });
  res.json(
    challenges.map(({ attempts, solution, tests, starterCode, prompt, hints, ...c }) => ({
      ...c,
      attemptCount: attempts.length,
      solved: attempts.some((a) => a.passed === a.total),
      due: c.reviewDueAt !== null && c.reviewDueAt <= new Date(),
    })),
  );
});

challengesRouter.get("/:slug", async (req, res) => {
  const challenge = await prisma.challenge.findUnique({
    where: { slug: req.params.slug },
    include: { attempts: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!challenge) throw new HttpError(404, "Challenge not found");
  res.json({ ...challenge, tests: JSON.parse(challenge.tests), hints: JSON.parse(challenge.hints) });
});

// Save an attempt. Attempts are never overwritten: your history is your learning record.
challengesRouter.post("/:slug/attempts", async (req, res) => {
  const data = body(
    req,
    z.object({
      code: z.string(),
      passed: z.number().int().min(0),
      total: z.number().int().min(1),
      durationMs: z.number().int().min(0),
    }),
  );
  const challenge = await prisma.challenge.findUnique({ where: { slug: req.params.slug } });
  if (!challenge) throw new HttpError(404, "Challenge not found");

  const review = reviewChallenge(challenge, data.passed === data.total);

  // Transaction: both writes succeed or neither does.
  const [attempt] = await prisma.$transaction([
    prisma.attempt.create({ data: { ...data, challengeId: challenge.id } }),
    prisma.challenge.update({ where: { id: challenge.id }, data: review }),
  ]);
  res.status(201).json({ attempt, ...review });
});

challengesRouter.put("/:slug/note", async (req, res) => {
  const { note } = body(req, z.object({ note: z.string() }));
  const updated = await prisma.challenge.update({ where: { slug: req.params.slug }, data: { note } });
  res.json({ note: updated.note });
});
