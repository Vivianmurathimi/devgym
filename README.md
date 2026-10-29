# DevGym

My personal training app for three things:

1. **Code**: LeetCode-style JavaScript challenges with automatic tests, hints, notes and spaced review.
2. **Exam**: CS final exam study with a topic checklist, flashcards, practice questions and a study timer.
3. **Thesis**: chapters with deadlines, sources, a daily writing log and defense-question flashcards.

Everything runs on your laptop. No account, no login, no hosting. Your data lives in one file: `server/prisma/devgym.db`.

---

## Run it (first time)

You need **Node.js 20 or newer** (`node -v` to check).

```bash
cd devgym
npm install        # installs everything for the server and the web app
npm run setup      # creates the database file and loads the starter content
npm run dev        # starts the API (port 3000) and the website (port 5173)
```

The browser opens at **http://localhost:5173**. Next time, only `npm run dev` is needed.

## Everyday use

| Page | What to do there |
|---|---|
| **Today** | Your to-do list: due flashcards, challenges to redo, writing to log, plus progress stats. |
| **Code** | Pick a challenge → write code → **Run tests** to check, **Submit** to save the attempt. Failing a submit brings the challenge back tomorrow. |
| **Exam** | **Topics**: click a status to move it to do → learning → done. **Flashcards**: rate Again/Hard/Good/Easy; cards you forget come back sooner. **Practice**: write a full answer, compare, self-grade 0–5 (weakest first). **Timer**: start/stop to log study time per subject. |
| **Thesis** | **Chapters**: status + due date + notes. **Sources**: citations linked to chapters. **Writing log**: words per day. **Defense prep**: flashcards for committee questions. |

The exam subjects, cards and thesis chapters are **generic starters**. Replace them with your real syllabus, past exam questions and thesis chapter titles in the app itself.

## Useful commands

```bash
npm run dev                          # start everything
npm test                             # run the backend unit tests (spaced repetition logic)
npm run db:studio --workspace server # open Prisma Studio: see/edit the database in a table view
npm run db:reset --workspace server  # ⚠ wipe ALL data and reload the starter content
```

**Backup:** copy `server/prisma/devgym.db` somewhere safe now and then (e.g. cloud drive). It is ignored by Git on purpose.

## Add your own coding challenges

Open `server/prisma/seed-data.ts`, copy one challenge object, change it, then run `npm run setup` again. New challenges are added; your attempts and study data are kept.

```ts
{
  slug: "my-challenge",          // used in the URL, must be unique
  title: "My challenge",
  difficulty: "easy",            // easy | medium | hard
  topic: "arrays",
  level: 3,                      // 1 foundations … 7 senior skills
  prompt: "Write `double(n)` that returns n * 2.",
  functionName: "double",
  params: "n",
  tests: [{ args: [2], expected: 4 }, { args: [0], expected: 0 }],
  hints: ["Multiply!"],
  solution: `function double(n) {\n  return n * 2;\n}`,
}
```

## How the code is organised

```
devgym/
├── server/                     Express + TypeScript + Prisma (the API)
│   ├── prisma/schema.prisma    the database tables
│   ├── prisma/seed-data.ts     starter challenges, subjects, chapters
│   └── src/
│       ├── index.ts            starts the server, error handling
│       ├── routes/             one file per area: challenges, study, thesis, dashboard
│       └── lib/srs.ts          spaced repetition logic (+ srs.test.ts)
└── web/                        React + TypeScript + Vite (the website)
    └── src/
        ├── pages/              Dashboard, Challenges, Workspace, Exam, Thesis
        ├── components/         Flashcards, Tabs
        └── lib/                api.ts (fetch wrapper), runner.ts (runs tests in a Web Worker)
```

How a challenge submit flows: `Workspace.tsx` runs your code in a Web Worker (`runner.ts`) → sends the result to `POST /api/challenges/:slug/attempts` → `routes/challenges.ts` saves the attempt and schedules a review with `lib/srs.ts` → Prisma writes it to SQLite.

## Features to build yourself (your learning path)

Each one is a real exercise. Do them in order once you're comfortable with the app.

1. **Keyboard shortcuts** for flashcards (Space = flip, 1–4 = grade). *React events.*
2. **Edit a flashcard** instead of delete-and-re-add: a `PATCH /api/cards/:id` route + an edit form. *Full-stack CRUD.*
3. **Export/import** all data as JSON. *API design, file download.*
4. **Monaco editor** (`@monaco-editor/react`) instead of the textarea. *Using a library.*
5. **A streak counter** on the dashboard (days in a row with any activity). *Dates + SQL.*
6. **TypeScript challenges**: run TS in the worker (e.g. with `sucrase`). *Tooling.*
7. **Move to Neon (PostgreSQL)**: change `provider` in `schema.prisma`, use `env("DATABASE_URL")`, learn migrations with `prisma migrate dev`. *Databases.*
