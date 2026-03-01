"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { generateContent, getBackendHealth } from "@/lib/api";
import type { BackendHealth, GenerateResponse } from "@/types";

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<GenerateResponse | null>(null);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkBackend = async () => {
      try {
        const result = await getBackendHealth();
        if (!mounted) return;
        setHealth(result);
        setBackendOnline(true);
      } catch {
        if (!mounted) return;
        setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (backendOnline) return "V1.1 • Backend online";
    return "V1.1 • Backend sleeping";
  }, [backendOnline]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await generateContent(topic.trim());
      setData(result);
      setBackendOnline(true);
    } catch (err) {
      console.error(err);
      setBackendOnline(false);
      setError("Could not connect to backend. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),#020617] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-cyan-400">
              SocialCrew AI
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Two-agent social content system powered by LangGraph + Groq
            </p>
          </div>

          <Link
            href="/backend"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              backendOnline
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-orange-500/40 bg-orange-500/10 text-orange-300"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                backendOnline
                  ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                  : "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.85)]"
              }`}
            />
            {statusLabel}
          </Link>
        </div>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_40px_rgba(34,211,238,0.05)]">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
              Creator agent
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
              Analyst agent
            </span>
            {health && (
              <span className="text-xs text-white/45">
                {health.creatorModel} + {health.analystModel}
              </span>
            )}
          </div>

          <label className="mb-3 block text-sm text-white/70">
            What topic should we create content for?
          </label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI productivity for founders, sustainable fashion, crypto trends..."
              className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none placeholder:text-white/25 focus:border-cyan-400"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-black shadow-[0_0_24px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-orange-300">{error}</p>}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_30px_rgba(34,211,238,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-cyan-300">
                  Content Creator
                </h2>
                <p className="text-sm text-white/50">
                  Multi-angle generated post options
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                Agent 01
              </div>
            </div>

            {!data && !loading && (
              <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/25">
                Generated posts will appear here
              </div>
            )}

            {loading && (
              <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
                Creator agent is drafting posts…
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm text-cyan-100/90">
                  <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                    Creator summary
                  </span>
                  {data.contentSummary}
                </div>

                {data.contentCreator.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-cyan-400/30"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">{post.title}</h3>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/45">
                        Option {post.id}
                      </span>
                    </div>

                    <p className="mb-3 whitespace-pre-line text-sm leading-6 text-white/80">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_30px_rgba(34,211,238,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-cyan-300">
                  Social Analyst
                </h2>
                <p className="text-sm text-white/50">
                  Best-post selection and messaging advice
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                Agent 02
              </div>
            </div>

            {!data && !loading && (
              <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/25">
                Analytics and recommendations will appear here
              </div>
            )}

            {loading && (
              <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
                Analyst agent is reviewing the drafts…
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">
                    Best pick
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Option {data.socialAnalyst.bestPost}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                    Why it wins
                  </p>
                  <p className="text-sm leading-6 text-white/80">
                    {data.socialAnalyst.reason}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                    Positioning
                  </p>
                  <p className="text-sm leading-6 text-white/80">
                    {data.socialAnalyst.positioning}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                    Suggestions
                  </p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {data.socialAnalyst.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
