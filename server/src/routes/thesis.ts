import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { body, idParam } from "../lib/validate.js";

export const thesisRouter = Router();

const dateOrNull = z
  .string()
  .nullable()
  .transform((s) => (s ? new Date(s) : null));

// ---- Chapters ----

thesisRouter.get("/chapters", async (_req, res) => {
  res.json(
    await prisma.chapter.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { sources: true } } } }),
  );
});

thesisRouter.post("/chapters", async (req, res) => {
  const { title } = body(req, z.object({ title: z.string().trim().min(1) }));
  const last = await prisma.chapter.findFirst({ orderBy: { order: "desc" } });
  res.status(201).json(await prisma.chapter.create({ data: { title, order: (last?.order ?? 0) + 1 } }));
});

thesisRouter.patch("/chapters/:id", async (req, res) => {
  const data = body(
    req,
    z.object({
      title: z.string().trim().min(1).optional(),
      status: z.enum(["not_started", "drafting", "review", "done"]).optional(),
      dueDate: dateOrNull.optional(),
      notes: z.string().optional(),
    }),
  );
  res.json(await prisma.chapter.update({ where: { id: idParam(req) }, data }));
});

thesisRouter.delete("/chapters/:id", async (req, res) => {
  await prisma.chapter.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

// ---- Sources ----

thesisRouter.get("/sources", async (_req, res) => {
  res.json(
    await prisma.source.findMany({ orderBy: { id: "desc" }, include: { chapter: { select: { title: true } } } }),
  );
});

thesisRouter.post("/sources", async (req, res) => {
  const data = body(
    req,
    z.object({
      citation: z.string().trim().min(1),
      url: z.string().default(""),
      notes: z.string().default(""),
      chapterId: z.number().int().nullable().optional(),
    }),
  );
  res.status(201).json(await prisma.source.create({ data }));
});

thesisRouter.delete("/sources/:id", async (req, res) => {
  await prisma.source.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});

// ---- Writing log ----

thesisRouter.get("/writing", async (_req, res) => {
  res.json(await prisma.writingLog.findMany({ orderBy: { date: "desc" }, take: 60 }));
});

thesisRouter.post("/writing", async (req, res) => {
  const data = body(req, z.object({ words: z.number().int().min(0), note: z.string().default("") }));
  res.status(201).json(await prisma.writingLog.create({ data }));
});

thesisRouter.delete("/writing/:id", async (req, res) => {
  await prisma.writingLog.delete({ where: { id: idParam(req) } });
  res.status(204).end();
});
