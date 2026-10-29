import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { challengesRouter } from "./routes/challenges.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { studyRouter } from "./routes/study.js";
import { thesisRouter } from "./routes/thesis.js";
import { HttpError } from "./lib/validate.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "DevGym API is running" });
});

app.use("/api/dashboard", dashboardRouter);
app.use("/api/challenges", challengesRouter);
app.use("/api", studyRouter);
app.use("/api", thesisRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler: every thrown error ends up here (Express 5 catches async errors).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input" });
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return res.status(404).json({ error: "Not found" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`DevGym API running at http://localhost:${PORT}`);
});
