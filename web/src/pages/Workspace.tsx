import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useData } from "../lib/useData";
import { runTests, type TestResult } from "../lib/runner";
import { fmtDate, show } from "../lib/format";
import type { Challenge } from "../lib/types";
import { ApiError } from "./Dashboard";

export default function Workspace() {
  const { slug } = useParams();
  const { data: ch, error, reload } = useData<Challenge>(`/challenges/${slug}`);
  const [code, setCode] = useState("");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(true);
  const started = useRef(Date.now());
  const draftKey = `devgym-draft-${slug}`;

  useEffect(() => {
    if (!ch) return;
    let draft: string | null = null;
    try { draft = localStorage.getItem(draftKey); } catch { /* storage unavailable */ }
    setCode(draft ?? ch.starterCode);
    setNote(ch.note);
    started.current = Date.now();
    // only when a different challenge loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch?.id]);

  function updateCode(value: string) {
    setCode(value);
    try { localStorage.setItem(draftKey, value); } catch { /* ignore */ }
  }

  // Tab key inserts two spaces instead of leaving the textarea.
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const t = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = t;
      updateCode(code.slice(0, s) + "  " + code.slice(end));
      requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = s + 2));
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(true);
  }

  async function run(save: boolean) {
    if (!ch) return;
    setRunning(true);
    const out = await runTests(code, ch.functionName, ch.tests);
    setResults(out.results);
    setFatal(out.fatal ?? null);
    setRunning(false);
    if (save) {
      const passed = out.results.filter((r) => r.pass).length;
      await api.post(`/challenges/${ch.slug}/attempts`, {
        code,
        passed,
        total: ch.tests.length,
        durationMs: Date.now() - started.current,
      });
      reload();
    }
  }

  async function saveNote() {
    if (!ch) return;
    await api.put(`/challenges/${ch.slug}/note`, { note });
    setNoteSaved(true);
  }

  if (error) return <ApiError message={error} />;
  if (!ch) return <p className="muted">Loading…</p>;

  const passedCount = results?.filter((r) => r.pass).length ?? 0;

  return (
    <div className="stack">
      <Link to="/code" className="muted small">← All challenges</Link>
      <div className="row between wrap">
        <h1>{ch.title}</h1>
        <span className="row gap">
          <span className="tag">{ch.topic}</span>
          <span className={`tag ${ch.difficulty}`}>{ch.difficulty}</span>
        </span>
      </div>

      <div className="workspace">
        <div className="stack">
          <section className="panel">
            <p className="prompt">{ch.prompt}</p>
            <h4>Examples</h4>
            <ul className="examples">
              {ch.tests.slice(0, 3).map((t, i) => (
                <li key={i}><code>{ch.functionName}({t.args.map(show).join(", ")}) → {show(t.expected)}</code></li>
              ))}
            </ul>
            <div className="row gap wrap">
              {hintsShown < ch.hints.length && (
                <button className="btn" onClick={() => setHintsShown(hintsShown + 1)}>
                  Show hint ({hintsShown}/{ch.hints.length})
                </button>
              )}
              <button className="btn" onClick={() => setShowSolution(!showSolution)}>
                {showSolution ? "Hide" : "Show"} solution
              </button>
            </div>
            {ch.hints.slice(0, hintsShown).map((h, i) => <p key={i} className="hint">💡 {h}</p>)}
            {showSolution && <pre className="code-block">{ch.solution}</pre>}
          </section>

          <section className="panel stack">
            <h4>My notes (what I learned, mistakes I made)</h4>
            <textarea rows={4} value={note} onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }} />
            <button className="btn" onClick={saveNote} disabled={noteSaved}>{noteSaved ? "Saved" : "Save note"}</button>
          </section>

          <section className="panel">
            <h4>History</h4>
            {ch.attempts.length === 0 ? <p className="muted">No attempts yet.</p> : (
              <ul className="list">
                {ch.attempts.map((a) => (
                  <li key={a.id} className="row between">
                    <span className="muted small">{fmtDate(a.createdAt)} · {Math.round(a.durationMs / 60000)} min</span>
                    <span className="row gap">
                      <span className={a.passed === a.total ? "ok" : "bad"}>{a.passed}/{a.total}</span>
                      <button className="link small" onClick={() => updateCode(a.code)}>load code</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="stack">
          <textarea
            className="editor"
            spellCheck={false}
            value={code}
            onChange={(e) => updateCode(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="row gap wrap">
            <button className="btn" onClick={() => run(false)} disabled={running}>Run tests</button>
            <button className="btn primary" onClick={() => run(true)} disabled={running}>Submit (Ctrl+Enter)</button>
            <button className="btn ghost" onClick={() => updateCode(ch.starterCode)}>Reset code</button>
          </div>

          {fatal && <div className="panel error">{fatal}</div>}
          {results && results.length > 0 && (
            <section className="panel">
              <h4 className={passedCount === results.length ? "ok" : "bad"}>
                {passedCount === results.length ? "All tests passed 🎉" : `${passedCount} / ${results.length} tests passed`}
              </h4>
              <ul className="list">
                {results.map((r, i) => (
                  <li key={i} className="result">
                    <span className={r.pass ? "ok" : "bad"}>{r.pass ? "✓" : "✗"}</span>{" "}
                    <code>{ch.functionName}({r.args.map(show).join(", ")})</code>
                    {!r.pass && (
                      <div className="muted small">
                        expected <code>{show(r.expected)}</code>
                        {r.error ? <> · error: {r.error}</> : <> · got <code>{show(r.actual)}</code></>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
