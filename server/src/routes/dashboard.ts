import { Router } from "express";
import { prisma } from "../db.js";

export const dashboardRouter = Router();

// Everything the home page needs, in one request.
dashboardRouter.get("/", async (_req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [challenges, solvedRows, dueChallenges, examDue, defenseDue, topics, sessions, chapters, writing, recent] =
    await Promise.all([
      prisma.challenge.count(),
      prisma.attempt.findMany({ where: {}, select: { challengeId: true, passed: true, total: true } }),
      prisma.challenge.findMany({
        where: { reviewDueAt: { lte: now } },
        select: { slug: true, title: true },
      }),
      prisma.card.count({ where: { deck: "exam", dueAt: { lte: now } } }),
      prisma.card.count({ where: { deck: "defense", dueAt: { lte: now } } }),
      prisma.topic.groupBy({ by: ["status"], _count: true }),
      prisma.studySession.findMany({
        where: { startedAt: { gte: weekAgo } },
        include: { subject: { select: { name: true } } },
      }),
      prisma.chapter.findMany({ orderBy: { order: "asc" } }),
      prisma.writingLog.findMany({ where: { date: { gte: weekAgo } } }),
      prisma.attempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { challenge: { select: { title: true, slug: true } } },
      }),
    ]);

  const solved = new Set(solvedRows.filter((a) => a.passed === a.total).map((a) => a.challengeId));

  const minutesBySubject: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.subject?.name ?? "Other";
    minutesBySubject[key] = (minutesBySubject[key] ?? 0) + s.minutes;
  }

  const topicCount = (status: string) => topics.find((t) => t.status === status)?._count ?? 0;
  const nextDeadline = chapters
    .filter((c) => c.status !== "done" && c.dueDate)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0];

  res.json({
    challenges: { total: challenges, solved: solved.size, due: dueChallenges },
    cards: { examDue, defenseDue },
    topics: { done: topicCount("done"), learning: topicCount("learning"), todo: topicCount("todo") },
    study: {
      minutesThisWeek: sessions.reduce((sum, s) => sum + s.minutes, 0),
      minutesBySubject,
    },
    thesis: {
      chaptersDone: chapters.filter((c) => c.status === "done").length,
      chaptersTotal: chapters.length,
      nextDeadline: nextDeadline ? { title: nextDeadline.title, dueDate: nextDeadline.dueDate } : null,
      wordsThisWeek: writing.reduce((sum, w) => sum + w.words, 0),
    },
    recentAttempts: recent,
  });
});
