import { useState } from "react";
import { api } from "../lib/api";
import { useData } from "../lib/useData";
import { daysUntil, fmtDate } from "../lib/format";
import type { Chapter, Source, WritingEntry } from "../lib/types";
import Flashcards from "../components/Flashcards";
import Tabs from "../components/Tabs";
import { ApiError } from "./Dashboard";

const TABS = ["Chapters", "Sources", "Writing log", "Defense prep"] as const;
type Tab = (typeof TABS)[number];

export default function Thesis() {
  const [tab, setTab] = useState<Tab>("Chapters");
  return (
    <div className="stack">
      <h1>Thesis</h1>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "Chapters" && <ChaptersTab />}
      {tab === "Sources" && <SourcesTab />}
      {tab === "Writing log" && <WritingTab />}
      {tab === "Defense prep" && (
        <>
          <p className="muted small">
            Questions the committee might ask. Edit the starter cards' answers by deleting them and adding your own.
          </p>
          <Flashcards deck="defense" />
        </>
      )}
    </div>
  );
}

const statuses: { value: Chapter["status"]; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "drafting", label: "Drafting" },
  { value: "review", label: "In review" },
  { value: "done", label: "Done" },
];

function ChaptersTab() {
  const { data, error, reload } = useData<Chapter[]>("/chapters");
  const [openId, setOpenId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  async function update(id: number, patch: Partial<Chapter>) {
    await api.patch(`/chapters/${id}`, patch);
    reload();
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/chapters", { title: newTitle });
    setNewTitle("");
    reload();
  }
  async function remove(c: Chapter) {
    if (!confirm(`Delete chapter "${c.title}"?`)) return;
    await api.del(`/chapters/${c.id}`);
    reload();
  }

  if (error) return <ApiError message={error} />;
  if (!data) return <p className="muted">Loading…</p>;
  const done = data.filter((c) => c.status === "done").length;

  return (
    <div className="stack">
      <section className="panel">
        <div className="row between"><h3>Progress</h3><span className="muted small">{done}/{data.length} chapters done</span></div>
        <div className="bar"><div style={{ width: `${(done / Math.max(1, data.length)) * 100}%` }} /></div>
      </section>
      {data.map((c) => {
        const days = c.dueDate ? daysUntil(c.dueDate) : null;
        return (
          <section key={c.id} className="panel stack">
            <div className="row between wrap">
              <button className="link title" onClick={() => setOpenId(openId === c.id ? null : c.id)}>
                {c.order}. {c.title}
              </button>
              <span className="row gap wrap">
                {days !== null && c.status !== "done" && (
                  <span className={`tag ${days < 0 ? "hard" : days <= 7 ? "warn" : ""}`}>
                    {days < 0 ? `${-days} days late` : days === 0 ? "due today" : `due in ${days} days`}
                  </span>
                )}
                <select value={c.status} onChange={(e) => update(c.id, { status: e.target.value as Chapter["status"] })}>
                  {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <input type="date" value={c.dueDate ? c.dueDate.slice(0, 10) : ""}
                  onChange={(e) => update(c.id, { dueDate: e.target.value || null })} />
              </span>
            </div>
            {openId === c.id && (
              <ChapterNotes chapter={c} onSave={(notes) => update(c.id, { notes })} onDelete={() => remove(c)} />
            )}
          </section>
        );
      })}
      <form className="panel row gap" onSubmit={add}>
        <input placeholder="New chapter title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
        <button className="btn primary">Add chapter</button>
      </form>
    </div>
  );
}

function ChapterNotes({ chapter, onSave, onDelete }: { chapter: Chapter; onSave: (n: string) => void; onDelete: () => void }) {
  const [notes, setNotes] = useState(chapter.notes);
  return (
    <div className="stack">
      <textarea rows={6} placeholder="Notes, outline, what's left to do, supervisor feedback…" value={notes}
        onChange={(e) => setNotes(e.target.value)} />
      <div className="row between">
        <button className="btn" onClick={() => onSave(notes)} disabled={notes === chapter.notes}>Save notes</button>
        <span className="row gap">
          <span className="muted small">{chapter._count.sources} sources linked</span>
          <button className="btn ghost danger-text" onClick={onDelete}>Delete chapter</button>
        </span>
      </div>
    </div>
  );
}

function SourcesTab() {
  const sources = useData<Source[]>("/sources");
  const chapters = useData<Chapter[]>("/chapters");
  const [form, setForm] = useState({ citation: "", url: "", notes: "", chapterId: "" });
  const [search, setSearch] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/sources", { ...form, chapterId: form.chapterId ? Number(form.chapterId) : null });
    setForm({ citation: "", url: "", notes: "", chapterId: form.chapterId });
    sources.reload();
  }
  async function remove(id: number) {
    await api.del(`/sources/${id}`);
    sources.reload();
  }

  const shown = (sources.data ?? []).filter((s) =>
    (s.citation + s.notes + (s.chapter?.title ?? "")).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="stack">
      <form className="panel stack" onSubmit={add}>
        <h3>Add a source</h3>
        <input placeholder="Citation (e.g. Fowler, M. (2018). Refactoring. Addison-Wesley.)" value={form.citation}
          onChange={(e) => setForm({ ...form, citation: e.target.value })} required />
        <div className="row gap">
          <input placeholder="URL / DOI (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}>
            <option value="">No chapter</option>
            {chapters.data?.map((c) => <option key={c.id} value={c.id}>{c.order}. {c.title}</option>)}
          </select>
        </div>
        <textarea rows={2} placeholder="Why it matters / key points" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn primary">Add source</button>
      </form>
      <section className="panel">
        <div className="row between">
          <h3>Sources ({sources.data?.length ?? 0})</h3>
          <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <ul className="list">
          {shown.map((s) => (
            <li key={s.id} className="source">
              <div className="row between">
                <span>{s.citation}</span>
                <button className="icon" onClick={() => remove(s.id)} title="Delete">×</button>
              </div>
              <div className="muted small">
                {s.chapter && <span className="tag">{s.chapter.title}</span>}{" "}
                {s.url && <a href={s.url.startsWith("http") ? s.url : `https://doi.org/${s.url}`} target="_blank" rel="noreferrer">{s.url}</a>}
              </div>
              {s.notes && <p className="small">{s.notes}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function WritingTab() {
  const { data, reload } = useData<WritingEntry[]>("/writing");
  const [words, setWords] = useState("");
  const [note, setNote] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/writing", { words: Number(words), note });
    setWords("");
    setNote("");
    reload();
  }
  async function remove(id: number) {
    await api.del(`/writing/${id}`);
    reload();
  }

  const total = data?.reduce((s, w) => s + w.words, 0) ?? 0;
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    return { label: d.getDate(), words: data?.filter((w) => new Date(w.date).toDateString() === key).reduce((s, w) => s + w.words, 0) ?? 0 };
  });
  const max = Math.max(1, ...last14.map((d) => d.words));

  return (
    <div className="stack">
      <form className="panel stack" onSubmit={add}>
        <h3>Log today's writing</h3>
        <div className="row gap">
          <input type="number" min={0} placeholder="Words written" value={words} onChange={(e) => setWords(e.target.value)} required />
          <input placeholder="What did you work on?" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn primary">Log</button>
        </div>
      </form>
      <section className="panel">
        <div className="row between"><h3>Last 14 days</h3><span className="muted small">{total.toLocaleString()} words logged in total</span></div>
        <div className="spark">
          {last14.map((d, i) => (
            <div key={i} className="spark-col" title={`${d.words} words`}>
              <div style={{ height: `${(d.words / max) * 100}%` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <ul className="list">
          {data?.map((w) => (
            <li key={w.id} className="row between">
              <span>{w.words.toLocaleString()} words{w.note && <span className="muted"> · {w.note}</span>}</span>
              <span className="row gap">
                <span className="muted small">{fmtDate(w.date)}</span>
                <button className="icon" onClick={() => remove(w.id)} title="Delete">×</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
