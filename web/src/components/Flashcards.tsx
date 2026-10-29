import { useState } from "react";
import { api } from "../lib/api";
import { useData } from "../lib/useData";
import { fmtDate } from "../lib/format";
import type { Card } from "../lib/types";

type Props = { deck: "exam" | "defense"; subjectId?: number };

// Review due cards one at a time, then rate how well you remembered.
export default function Flashcards({ deck, subjectId }: Props) {
  const query = `/cards?deck=${deck}${subjectId ? `&subjectId=${subjectId}` : ""}`;
  const due = useData<Card[]>(`${query}&due=true`);
  const all = useData<Card[]>(query);
  const [flipped, setFlipped] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [showAll, setShowAll] = useState(false);

  const current = due.data?.[0];

  async function grade(g: number) {
    if (!current) return;
    await api.post(`/cards/${current.id}/review`, { grade: g });
    setFlipped(false);
    due.reload();
    all.reload();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/cards", { deck, subjectId: subjectId ?? null, front, back });
    setFront("");
    setBack("");
    due.reload();
    all.reload();
  }

  async function remove(id: number) {
    await api.del(`/cards/${id}`);
    due.reload();
    all.reload();
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="row between">
          <h3>Review</h3>
          <span className="muted">{due.data?.length ?? 0} due</span>
        </div>
        {current ? (
          <div className="flashcard" onClick={() => setFlipped(true)}>
            {current.subject && <span className="tag">{current.subject.name}</span>}
            <p className="card-front">{current.front}</p>
            {flipped ? (
              <>
                <hr />
                <p className="card-back">{current.back}</p>
                <div className="row gap">
                  <button className="btn danger" onClick={() => grade(0)}>Again</button>
                  <button className="btn" onClick={() => grade(1)}>Hard</button>
                  <button className="btn primary" onClick={() => grade(2)}>Good</button>
                  <button className="btn" onClick={() => grade(3)}>Easy</button>
                </div>
              </>
            ) : (
              <p className="muted">Think of the answer, then click to reveal.</p>
            )}
          </div>
        ) : (
          <p className="muted">Nothing due. Come back later or add new cards.</p>
        )}
      </div>

      <form className="panel stack" onSubmit={add}>
        <h3>Add a card</h3>
        <input placeholder="Question" value={front} onChange={(e) => setFront(e.target.value)} required />
        <textarea placeholder="Answer" rows={3} value={back} onChange={(e) => setBack(e.target.value)} required />
        <button className="btn primary">Add card</button>
      </form>

      <div className="panel">
        <button className="link" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Hide" : "Show"} all cards ({all.data?.length ?? 0})
        </button>
        {showAll && (
          <ul className="list">
            {all.data?.map((c) => (
              <li key={c.id} className="row between">
                <span>{c.front}</span>
                <span className="row gap">
                  <span className="muted small">next {fmtDate(c.dueAt)}</span>
                  <button className="icon" onClick={() => remove(c.id)} title="Delete">×</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
