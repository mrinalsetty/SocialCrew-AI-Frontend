"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendHealth, getBackendMeta } from "@/lib/api";
import type { BackendHealth, BackendMeta } from "@/types";

export default function BackendDashboardPage() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [meta, setMeta] = useState<BackendMeta | null>(null);
  const [online, setOnline] = useState(false);

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
        setOnline(true);
      } catch {
        if (!mounted) return;
        setOnline(false);
      }
    };

    load();
    const interval = setInterval(load, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),#020617] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-cyan-400">
              Backend Dashboard
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Live system view for SocialCrew AI backend
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                online
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-orange-500/40 bg-orange-500/10 text-orange-300"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  online
                    ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                    : "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.85)]"
                }`}
              />
              {online ? "Backend online" : "Backend sleeping"}
            </div>

            <Link
              href="/"
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              Back to app
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            title="Service"
            value={health?.service ?? "Unavailable"}
            subtitle={health?.version ?? "—"}
          />
          <InfoCard
            title="Runtime"
            value={health?.graphRuntime ?? "—"}
            subtitle={health?.llmProvider ?? "—"}
          />
          <InfoCard
            title="Uptime"
            value={
              health ? `${Math.max(1, health.uptimeSeconds)}s` : "Unavailable"
            }
            subtitle={health?.timestamp ?? "—"}
          />
          <InfoCard
            title="Models"
            value={health?.creatorModel ?? "—"}
            subtitle={health?.analystModel ?? "—"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
              Architecture
            </h2>

            <div className="space-y-3">
              {meta?.architecture?.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/80">{step}</p>
                </div>
              )) || (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-white/30">
                  Waiting for backend metadata…
                </div>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Stack
              </h2>

              <StackGroup label="Runtime" items={meta?.stack?.runtime ?? []} />
              <StackGroup label="AI" items={meta?.stack?.ai ?? []} />
              <StackGroup label="Models" items={meta?.stack?.models ?? []} />
              <StackGroup
                label="Deployment"
                items={meta?.stack?.deployment ?? []}
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Endpoints
              </h2>

              <div className="space-y-3">
                {meta?.endpoints?.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm"
                  >
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                      {endpoint.method}
                    </span>
                    <code className="text-white/75">{endpoint.path}</code>
                  </div>
                )) || (
                  <div className="text-white/30">Waiting for endpoints…</div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="mb-4 text-2xl font-semibold text-cyan-300">
                Health JSON
              </h2>

              <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-white/70">
                {JSON.stringify(health, null, 2)}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">
        {title}
      </p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/45">{subtitle}</p>
    </div>
  );
}

function StackGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300/70">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-sm text-white/80"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-white/30">Unavailable</span>
        )}
      </div>
    </div>
  );
}
