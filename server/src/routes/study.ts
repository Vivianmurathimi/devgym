import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { reviewCard, type Grade } from "../lib/srs.js";
import { body, HttpError, idParam } from "../lib/validate.js";

export const studyRouter = Router();

// ---- Subjects & topic checklist ----

studyRouter.get("/subjects", async (_req, res) => {
  const now = new Date();
  const subjects = await prisma.subject.findMany({
    orderBy: { id: "asc" },
    include: {
      topics: { orderBy: { id: "asc" } },
      _count: { select: { cards: { where: { dueAt: { lte: now } } }, questions: true } },
    },
  });
  res.json(subjects);
});

studyRouter.post("/subjects", async (req, res) => {
  const { name } = body(req, z.object({ name: z.string().trim().min(1) }));
  res.status(201).json(await prisma.subject.create({ data: { name } }));
});

studyRouter.delete("/subjects/:id", async (req, res) => {
  await prisma.subject.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

studyRouter.post("/subjects/:id/topics", async (req, res) => {
  const { name } = body(req, z.object({ name: z.string().trim().min(1) }));
  res.status(201).json(await prisma.topic.create({ data: { name, subjectId: idParam(req) } }));
});

studyRouter.patch("/topics/:id", async (req, res) => {
  const { status } = body(req, z.object({ status: z.enum(["todo", "learning", "done"]) }));
  res.json(await prisma.topic.update({ where: { id: idParam(req) }, data: { status } }));
});

studyRouter.delete("/topics/:id", async (req, res) => {
  await prisma.topic.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

// ---- Flashcards ----

const deckQuery = z.object({
  deck: z.enum(["exam", "defense"]).default("exam"),
  subjectId: z.coerce.number().int().optional(),
  due: z.enum(["true", "false"]).optional(),
});

studyRouter.get("/cards", async (req, res) => {
  const q = deckQuery.parse(req.query);
  const cards = await prisma.card.findMany({
    where: {
      deck: q.deck,
      ...(q.subjectId ? { subjectId: q.subjectId } : {}),
      ...(q.due === "true" ? { dueAt: { lte: new Date() } } : {}),
    },
    orderBy: { dueAt: "asc" },
    include: { subject: { select: { name: true } } },
  });
  res.json(cards);
});

studyRouter.post("/cards", async (req, res) => {
  const data = body(
    req,
    z.object({
      deck: z.enum(["exam", "defense"]).default("exam"),
      subjectId: z.number().int().nullable().optional(),
      front: z.string().trim().min(1),
      back: z.string().trim().min(1),
    }),
  );
  res.status(201).json(await prisma.card.create({ data }));
});

studyRouter.post("/cards/:id/review", async (req, res) => {
  const { grade } = body(req, z.object({ grade: z.number().int().min(0).max(3) }));
  const card = await prisma.card.findUnique({ where: { id: idParam(req) } });
  if (!card) throw new HttpError(404, "Card not found");
  const next = reviewCard(card, grade as Grade);
  res.json(await prisma.card.update({ where: { id: card.id }, data: next }));
});

studyRouter.delete("/cards/:id", async (req, res) => {
  await prisma.card.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

// ---- Practice questions (write an answer, compare, self-grade 0-5) ----

studyRouter.get("/questions", async (req, res) => {
  const { subjectId } = z.object({ subjectId: z.coerce.number().int().optional() }).parse(req.query);
  res.json(
    await prisma.practiceQuestion.findMany({
      where: subjectId ? { subjectId } : {},
      orderBy: [{ lastScore: "asc" }, { id: "asc" }],
      include: { subject: { select: { name: true } } },
    }),
  );
});

studyRouter.post("/questions", async (req, res) => {
  const data = body(
    req,
    z.object({ subjectId: z.number().int(), question: z.string().trim().min(1), modelAnswer: z.string().trim().min(1) }),
  );
  res.status(201).json(await prisma.practiceQuestion.create({ data }));
});

studyRouter.patch("/questions/:id", async (req, res) => {
  const { myAnswer, lastScore } = body(
    req,
    z.object({ myAnswer: z.string(), lastScore: z.number().int().min(0).max(5) }),
  );
  res.json(
    await prisma.practiceQuestion.update({
      where: { id: idParam(req) },
      data: { myAnswer, lastScore, attempts: { increment: 1 } },
    }),
  );
});

studyRouter.delete("/questions/:id", async (req, res) => {
  await prisma.practiceQuestion.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

// ---- Study sessions (timer log) ----

studyRouter.get("/sessions", async (_req, res) => {
  res.json(
    await prisma.studySession.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { subject: { select: { name: true } } },
    }),
  );
});

studyRouter.post("/sessions", async (req, res) => {
  const data = body(
    req,
    z.object({
      subjectId: z.number().int().nullable().optional(),
      label: z.string().default(""),
      minutes: z.number().int().min(1),
    }),
  );
  res.status(201).json(await prisma.studySession.create({ data }));
});

studyRouter.delete("/sessions/:id", async (req, res) => {
  await prisma.studySession.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});
