"use client";

import { useMemo } from "react";
import { ChartBarIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/dashboard-header";
import KpiCard from "@/components/ui/kpi-card";
import { useMatchmakingMutation, useMarketplaceSnapshot, useNegotiations, useWasteLots } from "@/hooks/useMarketplaceData";

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function MissionControlPage() {
  const { data: snapshot, isLoading: snapshotLoading } = useMarketplaceSnapshot();
  const { data: negotiations, isLoading: negotiationsLoading } = useNegotiations();
  const { data: allLots, isLoading: lotsLoading } = useWasteLots();
  const matchmaking = useMatchmakingMutation();

  const { activeNegotiations, verifiedLots, tokenizedLots, pendingVerifications } = useMemo(() => {
    const lots = snapshot?.lots ?? [];
    return {
      activeNegotiations: (negotiations ?? []).filter((neg) => ["open", "counter"].includes(neg.status)).length,
      verifiedLots: lots.filter((lot) => lot.status === "verified" || lot.status === "tokenized").length,
      tokenizedLots: lots.filter((lot) => lot.token != null).length,
      pendingVerifications: lots.filter((lot) => lot.status === "pending_verification").length,
    };
  }, [snapshot, negotiations]);

  const kpis = useMemo(() => {
    const negotiationTone: "neutral" | "positive" | "warning" =
      activeNegotiations > 0 ? (activeNegotiations > 5 ? "warning" : "positive") : "neutral";

    return [
      {
        title: "Active negotiations",
        value: formatNumber(activeNegotiations),
        delta: `${(negotiations ?? []).length} total`,
        tone: negotiationTone,
      },
      {
        title: "Verified lots",
        value: formatNumber(verifiedLots),
        delta: `${formatNumber(pendingVerifications)} pending verification`,
        tone: "positive" as const,
      },
      {
        title: "Tokenized lots",
        value: formatNumber(tokenizedLots),
        delta: `${formatNumber((snapshot?.lots ?? []).length)} total lots`,
        tone: (tokenizedLots ? "positive" : "neutral") as "positive" | "neutral",
      },
      {
        title: "Agent roster",
        value: formatNumber(snapshot?.agents.length ?? 0),
        delta: "Autonomous + human-in-the-loop",
        tone: "neutral" as const,
      },
    ];
  }, [activeNegotiations, negotiations, pendingVerifications, snapshot, tokenizedLots, verifiedLots]);

  const timeline = useMemo(() => {
    const lotsById = new Map((snapshot?.lots ?? []).map((lot) => [lot.id, lot]));
    return (negotiations ?? [])
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((item) => {
        const lot = lotsById.get(item.waste_lot_id);
        return {
          id: item.id,
          lotLabel: lot?.external_reference ?? `Lot #${item.waste_lot_id}`,
          material: lot?.material_type ?? "Unknown material",
          status: item.status,
          updatedAt: new Date(item.updated_at).toLocaleString(),
        };
      });
  }, [negotiations, snapshot]);

  const highlights = useMemo(() => {
    return (snapshot?.lots ?? [])
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6)
      .map((lot) => ({
        id: lot.external_reference ?? `LOT-${lot.id.toString().padStart(4, "0")}`,
        material: lot.material_type,
        volume: `${lot.quantity_tons.toFixed(1)} tons`,
        price: lot.price_floor_usd_per_ton ? `$${lot.price_floor_usd_per_ton.toFixed(2)} / ton` : "TBD",
        signal:
          lot.status === "tokenized"
            ? "Settlement"
            : lot.status === "verified"
            ? "Ready to list"
            : lot.status.replace(/_/g, " "),
        updated: new Date(lot.updated_at).toLocaleDateString(),
      }));
  }, [snapshot]);

  const complianceQueue = useMemo(() => {
    return (allLots ?? [])
      .filter((lot) => ["pending_verification", "upcycling_pending"].includes(lot.status))
      .map((lot) => ({
        id: lot.id,
        title: lot.external_reference ?? lot.material_type,
        stage: lot.status.replace(/_/g, " "),
        owner: lot.verification?.verifier_notes ? "Auditor" : "AI verifier",
      }));
  }, [allLots]);

  const agentSignals = useMemo(() => {
    const totalAgents = snapshot?.agents.length ?? 0;
    const recyclerAgents = (snapshot?.agents ?? []).filter((agent) => agent.type === "recycler").length;
    const producerAgents = totalAgents - recyclerAgents;
    return [
      {
        id: "market",
        icon: SparklesIcon,
        tone: "primary" as const,
        title: "Agent network active",
        message: `${formatNumber(totalAgents)} agents watching ${formatNumber(snapshot?.lots.length ?? 0)} lots in real time.`,
      },
      {
        id: "recycler",
        icon: ChartBarIcon,
        tone: "emerald" as const,
        title: "Recycler coverage",
        message: `${formatNumber(recyclerAgents)} recycler agents are bidding; ${(negotiations ?? []).filter((n) => n.status === "open").length} negotiations open for counters.`,
      },
      {
        id: "producer",
        icon: TruckIcon,
        tone: "amber" as const,
        title: "Producer follow-ups",
        message: `${formatNumber(producerAgents)} producer agents monitoring lots. ${formatNumber(pendingVerifications)} lots awaiting verification evidence.`,
      },
    ];
  }, [negotiations, pendingVerifications, snapshot]);

  const loading = snapshotLoading || negotiationsLoading || lotsLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <DashboardHeader title="Mission Control" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => matchmaking.mutate()}
            disabled={matchmaking.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {matchmaking.isPending ? "Running agents…" : "Run agent matchmaking"}
          </button>
        </div>
      </div>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Syncing live data from agents…
        </section>
      ) : (
        <>
          <section>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Negotiation Timeline</h2>
                <span className="text-xs text-slate-400">Most recent updates</span>
              </div>
              <div className="mt-4 space-y-4">
                {timeline.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    No negotiations yet. Run matchmaking to spin up new agent pairings.
                  </p>
                ) : (
                  timeline.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{event.lotLabel}</p>
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                          {event.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Material: {event.material}</span>
                        <span>Updated {event.updatedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Agent Signals</h2>
                <span className="text-xs text-slate-400">Live recommendations</span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {agentSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <signal.icon className="mt-1 h-5 w-5 text-primary-600" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-slate-900">{signal.title}</p>
                      <p>{signal.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Marketplace Highlights</h2>
              <span className="text-xs text-slate-400">Agent-curated opportunities</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Price floor</th>
                    <th className="px-4 py-3">Signal</th>
                    <th className="px-4 py-3">Last update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {highlights.map((item) => (
                    <tr key={item.id} className="transition hover:bg-primary-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.id}</td>
                      <td className="px-4 py-3 text-slate-600">{item.material}</td>
                      <td className="px-4 py-3 text-slate-600">{item.volume}</td>
                      <td className="px-4 py-3 text-slate-600">{item.price}</td>
                      <td className="px-4 py-3 text-primary-600">{item.signal}</td>
                      <td className="px-4 py-3 text-slate-500">{item.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Compliance Queue</h2>
                <span className="text-xs text-slate-400">Lots needing attention</span>
              </div>
              <div className="mt-4 space-y-3">
                {complianceQueue.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    All verifications are up to date.
                  </p>
                ) : (
                  complianceQueue.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {item.stage}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Owner: {item.owner}</span>
                        <span className="uppercase tracking-wide text-amber-600">Pending</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Action Items</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  {pendingVerifications > 0
                    ? `${formatNumber(pendingVerifications)} lots await verification evidence uploads.`
                    : "Verification queue is empty. Keep capture devices running for new lots."}
                </li>
                <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  {tokenizedLots > 0
                    ? `${formatNumber(tokenizedLots)} lots are tokenized. Coordinate settlements with counterparties.`
                    : "Tokenize verified lots to unlock settlement workflows."}
                </li>
                <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  {activeNegotiations > 0
                    ? `Monitor ${formatNumber(activeNegotiations)} active negotiations for counter offers before expiry.`
                    : "Launch agent matchmaking to generate fresh negotiations."}
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
