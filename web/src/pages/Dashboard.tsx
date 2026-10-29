import { Link } from "react-router-dom";
import { useData } from "../lib/useData";
import { daysUntil, fmtMinutes } from "../lib/format";

type DashboardData = {
  challenges: { total: number; solved: number; due: { slug: string; title: string }[] };
  cards: { examDue: number; defenseDue: number };
  topics: { done: number; learning: number; todo: number };
  study: { minutesThisWeek: number; minutesBySubject: Record<string, number> };
  thesis: {
    chaptersDone: number;
    chaptersTotal: number;
    nextDeadline: { title: string; dueDate: string } | null;
    wordsThisWeek: number;
  };
  recentAttempts: { id: number; passed: number; total: number; challenge: { title: string; slug: string } }[];
};

export default function Dashboard() {
  const { data, error } = useData<DashboardData>("/dashboard");
  if (error) return <ApiError message={error} />;
  if (!data) return <p className="muted">Loading…</p>;

  const topicsTotal = data.topics.done + data.topics.learning + data.topics.todo;
  const maxMinutes = Math.max(1, ...Object.values(data.study.minutesBySubject));

  return (
    <div className="stack">
      <h1>Today</h1>

      <section className="panel">
        <h3>To do today</h3>
        <ul className="todo">
          {data.cards.examDue > 0 && (
            <li><Link to="/exam">Review {data.cards.examDue} exam flashcards</Link></li>
          )}
          {data.challenges.due.map((c) => (
            <li key={c.slug}><Link to={`/code/${c.slug}`}>Redo challenge: {c.title}</Link></li>
          ))}
          {data.cards.defenseDue > 0 && (
            <li><Link to="/thesis">Practise {data.cards.defenseDue} thesis defense questions</Link></li>
          )}
          {data.challenges.solved < data.challenges.total && (
            <li><Link to="/code">Solve one new coding challenge</Link></li>
          )}
          <li><Link to="/thesis">Log today's thesis writing</Link></li>
        </ul>
      </section>

      <div className="grid">
        <Stat label="Challenges solved" value={`${data.challenges.solved} / ${data.challenges.total}`}
          pct={data.challenges.solved / Math.max(1, data.challenges.total)} />
        <Stat label="Exam topics done" value={`${data.topics.done} / ${topicsTotal}`}
          pct={data.topics.done / Math.max(1, topicsTotal)} />
        <Stat label="Thesis chapters done" value={`${data.thesis.chaptersDone} / ${data.thesis.chaptersTotal}`}
          pct={data.thesis.chaptersDone / Math.max(1, data.thesis.chaptersTotal)} />
        <Stat label="Studied this week" value={fmtMinutes(data.study.minutesThisWeek)} />
        <Stat label="Words written this week" value={data.thesis.wordsThisWeek.toLocaleString()} />
        <Stat
          label="Next thesis deadline"
          value={data.thesis.nextDeadline ? data.thesis.nextDeadline.title : "None set"}
          sub={data.thesis.nextDeadline ? `in ${daysUntil(data.thesis.nextDeadline.dueDate)} days` : "Add dates in Thesis"}
        />
      </div>

      <div className="grid two">
        <section className="panel">
          <h3>Study time by subject (7 days)</h3>
          {Object.keys(data.study.minutesBySubject).length === 0 ? (
            <p className="muted">No sessions yet. Use the timer on the Exam page.</p>
          ) : (
            Object.entries(data.study.minutesBySubject).map(([name, mins]) => (
              <div key={name} className="bar-row">
                <span>{name}</span>
                <div className="bar"><div style={{ width: `${(mins / maxMinutes) * 100}%` }} /></div>
                <span className="muted small">{fmtMinutes(mins)}</span>
              </div>
            ))
          )}
        </section>
        <section className="panel">
          <h3>Recent coding attempts</h3>
          {data.recentAttempts.length === 0 ? (
            <p className="muted">No attempts yet.</p>
          ) : (
            <ul className="list">
              {data.recentAttempts.map((a) => (
                <li key={a.id} className="row between">
                  <Link to={`/code/${a.challenge.slug}`}>{a.challenge.title}</Link>
                  <span className={a.passed === a.total ? "ok" : "bad"}>{a.passed}/{a.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, pct, sub }: { label: string; value: string; pct?: number; sub?: string }) {
  return (
    <div className="panel stat">
      <span className="muted small">{label}</span>
      <strong>{value}</strong>
      {pct !== undefined && <div className="bar"><div style={{ width: `${pct * 100}%` }} /></div>}
      {sub && <span className="muted small">{sub}</span>}
    </div>
  );
}

export function ApiError({ message }: { message: string }) {
  return (
    <div className="panel error">
      <strong>Can't reach the API.</strong>
      <p>{message}</p>
      <p className="muted">Is the server running? Run <code>npm run dev</code> in the devgym folder.</p>
    </div>
  );
}
