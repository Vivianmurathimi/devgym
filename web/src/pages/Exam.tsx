import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useData } from "../lib/useData";
import { fmtDate, fmtMinutes } from "../lib/format";
import type { Question, Session, Subject, Topic } from "../lib/types";
import Flashcards from "../components/Flashcards";
import Tabs from "../components/Tabs";
import { ApiError } from "./Dashboard";

const TABS = ["Topics", "Flashcards", "Practice", "Timer"] as const;
type Tab = (typeof TABS)[number];

export default function Exam() {
  const subjects = useData<Subject[]>("/subjects");
  const [tab, setTab] = useState<Tab>("Topics");
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);

  if (subjects.error) return <ApiError message={subjects.error} />;

  return (
    <div className="stack">
      <div className="row between wrap">
        <h1>Final exam</h1>
        <select value={subjectId ?? ""} onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">All subjects</option>
          {subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Topics" && <TopicsTab subjects={subjects.data ?? []} subjectId={subjectId} reload={subjects.reload} />}
      {tab === "Flashcards" && <Flashcards key={subjectId ?? "all"} deck="exam" subjectId={subjectId} />}
      {tab === "Practice" && <PracticeTab subjectId={subjectId} subjects={subjects.data ?? []} />}
      {tab === "Timer" && <TimerTab subjects={subjects.data ?? []} defaultSubject={subjectId} />}
    </div>
  );
}

const nextStatus: Record<Topic["status"], Topic["status"]> = { todo: "learning", learning: "done", done: "todo" };
const statusLabel: Record<Topic["status"], string> = { todo: "○ to do", learning: "◐ learning", done: "● done" };

function TopicsTab({ subjects, subjectId, reload }: { subjects: Subject[]; subjectId?: number; reload: () => void }) {
  const [newSubject, setNewSubject] = useState("");
  const shown = subjectId ? subjects.filter((s) => s.id === subjectId) : subjects;

  async function cycle(t: Topic) {
    await api.patch(`/topics/${t.id}`, { status: nextStatus[t.status] });
    reload();
  }
  async function addTopic(subject: Subject, name: string) {
    await api.post(`/subjects/${subject.id}/topics`, { name });
    reload();
  }
  async function removeTopic(id: number) {
    await api.del(`/topics/${id}`);
    reload();
  }
  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/subjects", { name: newSubject });
    setNewSubject("");
    reload();
  }
  async function removeSubject(s: Subject) {
    if (!confirm(`Delete "${s.name}" with all its topics, cards and questions?`)) return;
    await api.del(`/subjects/${s.id}`);
    reload();
  }

  return (
    <div className="stack">
      <p className="muted small">Click a topic's status to move it: to do → learning → done.</p>
      {shown.map((s) => {
        const done = s.topics.filter((t) => t.status === "done").length;
        return (
          <section key={s.id} className="panel">
            <div className="row between">
              <h3>{s.name}</h3>
              <span className="row gap">
                <span className="muted small">{done}/{s.topics.length} done · {s._count.cards} cards due</span>
                <button className="icon" title="Delete subject" onClick={() => removeSubject(s)}>×</button>
              </span>
            </div>
            <div className="bar"><div style={{ width: `${(done / Math.max(1, s.topics.length)) * 100}%` }} /></div>
            <ul className="list">
              {s.topics.map((t) => (
                <li key={t.id} className="row between">
                  <span className={t.status === "done" ? "struck" : ""}>{t.name}</span>
                  <span className="row gap">
                    <button className={`status ${t.status}`} onClick={() => cycle(t)}>{statusLabel[t.status]}</button>
                    <button className="icon" onClick={() => removeTopic(t.id)} title="Delete">×</button>
                  </span>
                </li>
              ))}
            </ul>
            <InlineAdd placeholder="Add a topic…" onAdd={(name) => addTopic(s, name)} />
          </section>
        );
      })}
      {!subjectId && (
        <form className="panel row gap" onSubmit={addSubject}>
          <input placeholder="New subject (e.g. Computer Architecture)" value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)} required />
          <button className="btn primary">Add subject</button>
        </form>
      )}
    </div>
  );
}

function InlineAdd({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form className="row gap" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(""); } }}>
      <input placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn">Add</button>
    </form>
  );
}

function PracticeTab({ subjectId, subjects }: { subjectId?: number; subjects: Subject[] }) {
  const { data, reload } = useData<Question[]>(`/questions${subjectId ? `?subjectId=${subjectId}` : ""}`);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [form, setForm] = useState({ subjectId: subjectId ?? subjects[0]?.id ?? 0, question: "", modelAnswer: "" });

  const q = data?.[index % Math.max(1, data.length)];

  useEffect(() => {
    setAnswer(q?.myAnswer ?? "");
    setRevealed(false);
  }, [q?.id]);

  async function score(s: number) {
    if (!q) return;
    await api.patch(`/questions/${q.id}`, { myAnswer: answer, lastScore: s });
    await reload();
    setIndex(index + 1);
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/questions", { ...form, subjectId: Number(form.subjectId || subjects[0]?.id) });
    setForm({ ...form, question: "", modelAnswer: "" });
    reload();
  }

  return (
    <div className="stack">
      <section className="panel stack">
        {q ? (
          <>
            <div className="row between">
              <span className="tag">{q.subject.name}</span>
              <span className="muted small">
                {q.lastScore === null ? "never answered" : `last score ${q.lastScore}/5`} · question {(index % data!.length) + 1} of {data!.length}
              </span>
            </div>
            <p className="card-front">{q.question}</p>
            <textarea rows={6} placeholder="Write your answer as you would in the exam…" value={answer}
              onChange={(e) => setAnswer(e.target.value)} />
            {!revealed ? (
              <div className="row gap">
                <button className="btn primary" onClick={() => setRevealed(true)}>Compare with model answer</button>
                <button className="btn ghost" onClick={() => setIndex(index + 1)}>Skip</button>
              </div>
            ) : (
              <>
                <div className="model-answer"><strong>Model answer</strong><p>{q.modelAnswer}</p></div>
                <p className="muted small">How good was your answer? (0 = blank, 5 = perfect)</p>
                <div className="row gap">
                  {[0, 1, 2, 3, 4, 5].map((s) => <button key={s} className="btn" onClick={() => score(s)}>{s}</button>)}
                </div>
              </>
            )}
          </>
        ) : (
          <p className="muted">No practice questions yet. Add one below.</p>
        )}
      </section>
      <p className="muted small">Questions with the lowest scores come first, so you practise your weak spots.</p>

      <form className="panel stack" onSubmit={add}>
        <h3>Add a practice question</h3>
        <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: Number(e.target.value) })}>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <textarea rows={2} placeholder="Question (e.g. from past exam papers)" value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })} required />
        <textarea rows={4} placeholder="Model answer" value={form.modelAnswer}
          onChange={(e) => setForm({ ...form, modelAnswer: e.target.value })} required />
        <button className="btn primary">Add question</button>
      </form>
    </div>
  );
}

const TIMER_KEY = "devgym-timer";

function TimerTab({ subjects, defaultSubject }: { subjects: Subject[]; defaultSubject?: number }) {
  const sessions = useData<Session[]>("/sessions");
  const [subjectId, setSubjectId] = useState<number | "">(defaultSubject ?? "");
  const [label, setLabel] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(() => {
    try { const v = localStorage.getItem(TIMER_KEY); return v ? Number(v) : null; } catch { return null; }
  });
  const [now, setNow] = useState(Date.now());
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  function start() {
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    try { localStorage.setItem(TIMER_KEY, String(t)); } catch { /* ignore */ }
  }
  async function stop() {
    if (!startedAt) return;
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    await log(minutes);
    setStartedAt(null);
    try { localStorage.removeItem(TIMER_KEY); } catch { /* ignore */ }
  }
  async function log(minutes: number) {
    await api.post("/sessions", { subjectId: subjectId === "" ? null : subjectId, label, minutes });
    sessions.reload();
  }
  async function remove(id: number) {
    await api.del(`/sessions/${id}`);
    sessions.reload();
  }

  const elapsed = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="stack">
      <section className="panel stack">
        <div className="row gap wrap">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">No subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input placeholder="What are you studying? (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="timer">{mm}:{ss}</div>
        {startedAt ? (
          <button className="btn danger" onClick={stop}>Stop & save</button>
        ) : (
          <button className="btn primary" onClick={start}>Start studying</button>
        )}
        <form className="row gap" onSubmit={(e) => { e.preventDefault(); if (Number(manual) > 0) { log(Number(manual)); setManual(""); } }}>
          <input type="number" min={1} placeholder="Or log minutes manually" value={manual} onChange={(e) => setManual(e.target.value)} />
          <button className="btn">Log</button>
        </form>
      </section>

      <section className="panel">
        <h3>Recent sessions</h3>
        <ul className="list">
          {sessions.data?.map((s) => (
            <li key={s.id} className="row between">
              <span>{s.subject?.name ?? "Other"}{s.label && <span className="muted"> · {s.label}</span>}</span>
              <span className="row gap">
                <span className="muted small">{fmtDate(s.startedAt)} · {fmtMinutes(s.minutes)}</span>
                <button className="icon" onClick={() => remove(s.id)} title="Delete">×</button>
              </span>
            </li>
          ))}
        </ul>
        {sessions.data?.length === 0 && <p className="muted">No sessions yet.</p>}
      </section>
    </div>
  );
}
