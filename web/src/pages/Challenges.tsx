import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/useData";
import type { ChallengeSummary } from "../lib/types";
import { ApiError } from "./Dashboard";

const levelNames: Record<number, string> = {
  1: "Level 1 · Foundations",
  2: "Level 2 · Thinking in code",
  3: "Level 3 · The web",
  4: "Level 4 · React",
  5: "Level 5 · TypeScript",
  6: "Level 6 · Backend",
  7: "Level 7 · Senior skills",
};

export default function Challenges() {
  const { data, error } = useData<ChallengeSummary[]>("/challenges");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unsolved" | "due">("all");

  if (error) return <ApiError message={error} />;
  if (!data) return <p className="muted">Loading…</p>;

  const visible = data.filter(
    (c) =>
      (c.title + c.topic).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || (filter === "unsolved" ? !c.solved : c.due)),
  );
  const levels = [...new Set(visible.map((c) => c.level))];

  return (
    <div className="stack">
      <div className="row between wrap">
        <h1>Coding challenges</h1>
        <div className="row gap">
          <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All</option>
            <option value="unsolved">Unsolved</option>
            <option value="due">Due for review</option>
          </select>
        </div>
      </div>

      {levels.map((level) => (
        <section key={level} className="panel">
          <h3>{levelNames[level] ?? `Level ${level}`}</h3>
          <ul className="list">
            {visible
              .filter((c) => c.level === level)
              .map((c) => (
                <li key={c.slug} className="row between">
                  <Link to={`/code/${c.slug}`}>
                    {c.solved ? "✓ " : ""}
                    {c.title}
                  </Link>
                  <span className="row gap">
                    {c.due && <span className="tag warn">review</span>}
                    <span className="tag">{c.topic}</span>
                    <span className={`tag ${c.difficulty}`}>{c.difficulty}</span>
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
      {visible.length === 0 && <p className="muted">No challenges match.</p>}
      <p className="muted small">
        Add your own challenges in <code>server/prisma/seed-data.ts</code>, then run <code>npm run setup</code>.
      </p>
    </div>
  );
}
