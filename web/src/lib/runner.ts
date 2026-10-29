import type { TestCase } from "./types";

export type TestResult = {
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
  pass: boolean;
};

// The code runs inside a Web Worker: a separate thread, so an infinite loop
// can't freeze the page. We kill it after a timeout.
const workerSource = `
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}
self.onmessage = (e) => {
  const { code, functionName, tests } = e.data;
  let fn;
  try {
    const cleaned = code.replace(/^\\s*export\\s+(default\\s+)?/gm, "").replace(/^\\s*export\\s*\\{[^}]*\\};?/gm, "");
    fn = new Function(cleaned + "\\n;return typeof " + functionName + " === 'function' ? " + functionName + " : undefined;")();
  } catch (err) {
    self.postMessage({ fatal: "Syntax error: " + err.message });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({ fatal: "Could not find a function called " + functionName });
    return;
  }
  const results = tests.map((t) => {
    try {
      const actual = fn(...structuredClone(t.args));
      return { args: t.args, expected: t.expected, actual: actual === undefined ? "undefined" : actual, pass: deepEqual(actual, t.expected) };
    } catch (err) {
      return { args: t.args, expected: t.expected, error: String(err && err.message || err), pass: false };
    }
  });
  self.postMessage({ results });
};
`;

export function runTests(
  code: string,
  functionName: string,
  tests: TestCase[],
  timeoutMs = 2000,
): Promise<{ results: TestResult[]; fatal?: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    const finish = (value: { results: TestResult[]; fatal?: string }) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(value);
    };
    const timer = setTimeout(
      () => finish({ results: [], fatal: `Timed out after ${timeoutMs / 1000}s: probably an infinite loop.` }),
      timeoutMs,
    );
    worker.onmessage = (e) => finish({ results: e.data.results ?? [], fatal: e.data.fatal });
    worker.onerror = (e) => finish({ results: [], fatal: e.message });
    worker.postMessage({ code, functionName, tests });
  });
}
