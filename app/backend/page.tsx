"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_URL, getBackendHealth, getBackendMeta } from "@/lib/api";
import type { BackendHealth, BackendMeta } from "@/types";

export default function BackendDashboardPage() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [meta, setMeta] = useState<BackendMeta | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [healthResult, metaResult] = await Promise.all([
          getBackendHealth(),
          getBackendMeta(),
        ]);

        if (!mounted) return;

        setHealth(healthResult);
        setMeta(metaResult);
        setBackendOnline(true);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setBackendOnline(false);
      }
    };

    void load();

    const interval = setInterval(() => {
      void load();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (backendOnline) return "Backend online";
    return "Backend sleeping / unavailable";
  }, [backendOnline]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),#020617] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-cyan-400">
              Backend Dashboard
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Health, architecture, stack, and deployment status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={API_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15"
            >
              Wake Up Server
            </a>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-cyan-400/25 hover:text-cyan-300"
            >
              Back to App
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                Status
              </p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  backendOnline ? "text-emerald-300" : "text-orange-300"
                }`}
              >
                {statusLabel}
              </p>
            </div>

            <div
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
              {backendOnline ? "Online" : "Sleeping"}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Service"
            value={health?.service || "Unavailable"}
            subvalue={`Version: ${health?.version || "—"}`}
          />
          <Card
            title="LLM Provider"
            value={health?.llmProvider || "Unavailable"}
            subvalue={health?.graphRuntime || "—"}
          />
          <Card
            title="Creator Model"
            value={health?.creatorModel || "Unavailable"}
            subvalue="Generation model"
          />
          <Card
            title="Analyst Model"
            value={health?.analystModel || "Unavailable"}
            subvalue="Evaluation model"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
              Architecture
            </h2>

            <div className="space-y-3">
              {(meta?.architecture || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-white/30">
                  Architecture info unavailable
                </div>
              ) : (
                meta?.architecture.map((item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="rounded-2xl border border-white/10 bg-black/35 p-4"
                  >
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
                      Step {index + 1}
                    </p>
                    <p className="text-sm leading-6 text-white/80">{item}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Stack
              </h2>

              <StackRow title="Runtime" items={meta?.stack.runtime || []} />
              <StackRow title="AI" items={meta?.stack.ai || []} />
              <StackRow title="Models" items={meta?.stack.models || []} />
              <StackRow
                title="Deployment"
                items={meta?.stack.deployment || []}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Quick Links
              </h2>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`${API_URL}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/75 transition hover:border-cyan-400/25 hover:text-cyan-300"
                >
                  /health
                </a>
                <a
                  href={`${API_URL}/system/meta`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/75 transition hover:border-cyan-400/25 hover:text-cyan-300"
                >
                  /system/meta
                </a>
                <a
                  href={API_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-sm text-white/75 transition hover:border-cyan-400/25 hover:text-cyan-300"
                >
                  Backend Root
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Health JSON
              </h2>

              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35 p-4 text-xs leading-6 text-white/70">
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  subvalue,
}: {
  title: string;
  value: string;
  subvalue: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
        {title}
      </p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/45">{subvalue}</p>
    </div>
  );
}

function StackRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
            Unavailable
          </span>
        ) : (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-white/75"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
