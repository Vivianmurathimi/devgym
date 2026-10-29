import { describe, expect, it } from "vitest";
import { reviewCard, reviewChallenge } from "./srs.js";

const now = new Date("2026-01-01T12:00:00Z");
const fresh = { intervalDays: 0, ease: 2.5, reps: 0 };

describe("reviewCard", () => {
  it("shows a forgotten card again in 10 minutes", () => {
    const r = reviewCard({ intervalDays: 10, ease: 2.5, reps: 4 }, 0, now);
    expect(r.reps).toBe(0);
    expect(r.dueAt.getTime() - now.getTime()).toBe(10 * 60 * 1000);
  });

  it("follows the 1 day -> 3 days -> interval*ease ladder", () => {
    const a = reviewCard(fresh, 2, now);
    expect(a.intervalDays).toBe(1);
    const b = reviewCard(a, 2, now);
    expect(b.intervalDays).toBe(3);
    const c = reviewCard(b, 2, now);
    expect(c.intervalDays).toBe(8); // round(3 * 2.5)
  });

  it("never lets ease drop below 1.3", () => {
    let card = { intervalDays: 1, ease: 1.35, reps: 2 };
    card = reviewCard(card, 1, now);
    card = reviewCard(card, 1, now);
    expect(card.ease).toBe(1.3);
  });
});

describe("reviewChallenge", () => {
  it("schedules a failed challenge for tomorrow", () => {
    const r = reviewChallenge({ reviewDueAt: null, reviewInterval: 0 }, false, now);
    expect(r.reviewInterval).toBe(1);
  });

  it("graduates after enough successful reviews", () => {
    let s: { reviewDueAt: Date | null; reviewInterval: number } = { reviewDueAt: now, reviewInterval: 12 };
    s = reviewChallenge(s, true, now);
    expect(s.reviewDueAt).toBeNull();
  });
});
