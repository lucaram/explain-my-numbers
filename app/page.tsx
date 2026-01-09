// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";

type ExplainResult =
  | { ok: true; explanation: string }
  | { ok: false; error: string };

export default function HomePage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const canExplain = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    const content = await f.text();
    setText(content);
    setResult(null);
  }

  async function explain() {
    if (!canExplain) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });

      const data = (await res.json()) as ExplainResult;
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message ?? "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setText("");
    setFileName(null);
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Explain My Numbers</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Paste numbers or upload a CSV. Get a structured explanation. Privacy-first: we don’t store your file by default.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              <input type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={onFile} />
              <span>Upload CSV / TXT</span>
              {fileName ? <span className="text-zinc-300">({fileName})</span> : null}
            </label>

            <div className="flex gap-2">
              <button
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Reset
              </button>
              <button
                onClick={explain}
                disabled={!canExplain}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Explaining…" : "Explain (£1 later)"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder="Paste numbers, a table, or CSV content here…"
              className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
            <p className="mt-2 text-xs text-zinc-400">
              Tip: Include a time column if you want “what changed” analysis (e.g., date/week/month).
            </p>
          </div>
        </section>

        {result ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            {result.ok ? (
              <>
                <h2 className="text-lg font-semibold">Explanation</h2>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-100">
                  {result.explanation}
                </pre>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-rose-300">Error</h2>
                <p className="mt-2 text-sm text-zinc-200">{result.error}</p>
              </>
            )}
          </section>
        ) : null}

        <footer className="mt-10 text-xs text-zinc-500">
          MVP: one-page, no login, no storage. Next: credits (£1), history, exports.
        </footer>
      </div>
    </main>
  );
}
