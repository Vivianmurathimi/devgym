export type TestCase = { args: unknown[]; expected: unknown };

export type ChallengeSummary = {
  id: number;
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  level: number;
  attemptCount: number;
  solved: boolean;
  due: boolean;
};

export type Attempt = { id: number; passed: number; total: number; durationMs: number; createdAt: string; code: string };

export type Challenge = ChallengeSummary & {
  prompt: string;
  functionName: string;
  starterCode: string;
  tests: TestCase[];
  hints: string[];
  solution: string;
  note: string;
  attempts: Attempt[];
};

export type Topic = { id: number; name: string; status: "todo" | "learning" | "done" };
export type Subject = { id: number; name: string; topics: Topic[]; _count: { cards: number; questions: number } };
export type Card = {
  id: number;
  deck: "exam" | "defense";
  front: string;
  back: string;
  dueAt: string;
  intervalDays: number;
  subject: { name: string } | null;
};
export type Question = {
  id: number;
  question: string;
  modelAnswer: string;
  myAnswer: string;
  lastScore: number | null;
  attempts: number;
  subject: { name: string };
};
export type Session = { id: number; minutes: number; label: string; startedAt: string; subject: { name: string } | null };
export type Chapter = {
  id: number;
  order: number;
  title: string;
  status: "not_started" | "drafting" | "review" | "done";
  dueDate: string | null;
  notes: string;
  _count: { sources: number };
};
export type Source = { id: number; citation: string; url: string; notes: string; chapter: { title: string } | null };
export type WritingEntry = { id: number; date: string; words: number; note: string };
