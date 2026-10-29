// Spaced repetition: decides WHEN you should see something again.
// Simplified version of the SM-2 algorithm used by Anki.

export type Grade = 0 | 1 | 2 | 3; // 0 = again, 1 = hard, 2 = good, 3 = easy

export type CardState = {
  intervalDays: number;
  ease: number;
  reps: number;
};

export type ReviewResult = CardState & { dueAt: Date };

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function reviewCard(card: CardState, grade: Grade, now = new Date()): ReviewResult {
  if (grade === 0) {
    // Forgot it: see it again in 10 minutes and restart the ladder.
    return {
      intervalDays: 0,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      reps: 0,
      dueAt: new Date(now.getTime() + 10 * 60 * 1000),
    };
  }

  let interval: number;
  let ease = card.ease;

  if (grade === 1) {
    interval = Math.max(1, Math.round(card.intervalDays * 1.2));
    ease -= 0.15;
  } else {
    if (card.reps === 0) interval = 1;
    else if (card.reps === 1) interval = 3;
    else interval = Math.round(card.intervalDays * card.ease);
    if (grade === 3) {
      interval = Math.round(interval * 1.3) || 1;
      ease += 0.15;
    }
  }

  return {
    intervalDays: interval,
    ease: Math.max(MIN_EASE, Number(ease.toFixed(2))),
    reps: card.reps + 1,
    dueAt: new Date(now.getTime() + interval * DAY_MS),
  };
}

// Coding challenges: failing schedules a review tomorrow; passing a review
// doubles the gap; once the gap reaches 3 weeks you've "graduated".
export function reviewChallenge(
  state: { reviewDueAt: Date | null; reviewInterval: number },
  passedAll: boolean,
  now = new Date(),
): { reviewDueAt: Date | null; reviewInterval: number } {
  if (!passedAll) {
    return { reviewInterval: 1, reviewDueAt: new Date(now.getTime() + DAY_MS) };
  }
  if (state.reviewDueAt === null) return state; // solved first time, nothing to review
  const next = Math.max(3, state.reviewInterval * 2);
  if (next >= 21) return { reviewDueAt: null, reviewInterval: 0 };
  return { reviewInterval: next, reviewDueAt: new Date(now.getTime() + next * DAY_MS) };
}
