"use client";

import { useMemo } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { useMarketplaceSnapshot, useNegotiations } from "@/hooks/useMarketplaceData";
import type { MarketplaceSnapshot } from "@/lib/api-client";

type MarketplaceKpi = {
  title: string;
  value: string;
  delta: string;
  tone?: "neutral" | "positive" | "warning";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function MarketplaceExplorerPage() {
  const { data: snapshot, isLoading } = useMarketplaceSnapshot();
  const { data: negotiations } = useNegotiations();

  const lots = useMemo<MarketplaceLot[]>(() => snapshot?.lots ?? [], [snapshot]);

  const kpis = useMemo<MarketplaceKpi[]>(() => {
    if (!lots.length) {
      return [
        { title: "Open interest", value: "$0", delta: "Awaiting lots", tone: "neutral" },
        { title: "Lots live", value: "0", delta: "Create a lot to begin" },
        { title: "Average spread", value: "0%", delta: "No negotiations", tone: "neutral" },
        { title: "Settlement velocity", value: "-", delta: "Insufficient data" },
      ];
    }

    const openInterest = lots.reduce(
      (sum, lot) => sum + (lot.price_floor_usd_per_ton ?? 0) * lot.quantity_tons,
      0
    );
    const spreadSamples = (negotiations ?? [])
      .map((neg) => {
        const bids = [neg.producer_offer_usd_per_ton, neg.recycler_offer_usd_per_ton].filter((value): value is number => value != null);
        if (bids.length < 2) {
          return null;
        }
        const [producer, recycler] = bids;
        return Math.abs(((recycler - producer) / producer) * 100);
      })
      .filter((value): value is number => value != null);

    const avgSpread = spreadSamples.length
      ? `${(spreadSamples.reduce((sum, value) => sum + value, 0) / spreadSamples.length).toFixed(1)}%`
      : "0%";

    const settlementVelocity = lots
      .filter((lot) => lot.token?.minted_at)
      .map((lot) => {
        const created = new Date(lot.created_at).getTime();
        const minted = new Date(lot.token!.minted_at).getTime();
        return (minted - created) / (1000 * 60 * 60);
      });

    const avgVelocity = settlementVelocity.length
      ? `${Math.round(
          settlementVelocity.reduce((sum, value) => sum + value, 0) / settlementVelocity.length
        )}h`
      : "-";

    return [
      { title: "Open interest", value: formatCurrency(openInterest), delta: `${lots.length} verified lots`, tone: "positive" },
      { title: "Lots live", value: lots.length.toString(), delta: `${lots.filter((lot) => lot.status === "verified").length} ready to tokenize` },
      { title: "Average spread", value: avgSpread, delta: `${spreadSamples.length} negotiation samples`, tone: "positive" },
      { title: "Settlement velocity", value: avgVelocity, delta: "Time from listing to mint" },
    ];
  }, [lots, negotiations]);

  const orderBook = useMemo(
    () =>
      lots
        .slice()
        .sort((a, b) => (b.price_floor_usd_per_ton ?? 0) - (a.price_floor_usd_per_ton ?? 0))
        .map((lot) => ({
          id: lot.external_reference ?? `LOT-${lot.id}`,
          material: lot.material_type,
          volume: `${lot.quantity_tons.toFixed(1)} tons`,
          price: lot.price_floor_usd_per_ton ? `$${lot.price_floor_usd_per_ton.toFixed(2)}` : "TBD",
          status: lot.status,
          updated: new Date(lot.updated_at).toLocaleString(),
        }))
        .slice(0, 15),
    [lots]
  );

  const depth = useMemo(() => {
    return [
      {
        label: "Tokenized",
        count: lots.filter((lot) => lot.token).length,
      },
      {
        label: "Verified",
        count: lots.filter((lot) => lot.status === "verified").length,
      },
      {
        label: "Negotiating",
        count: lots.filter((lot) => lot.status === "negotiating").length,
      },
      {
        label: "Pending verification",
        count: lots.filter((lot) => lot.status === "pending_verification").length,
      },
    ];
  }, [lots]);

  const agentEvents = useMemo(() => {
    const events: Array<{ id: string; message: string; tone: "primary" | "emerald" | "amber" }> = [];
    (negotiations ?? []).slice(0, 5).forEach((neg) => {
      events.push({
        id: `neg-${neg.id}`,
        message: `Negotiation #${neg.id} updated — status ${neg.status.replace(/_/g, " ")}.`,
        tone: neg.status === "agreed" ? "emerald" : neg.status === "counter" ? "amber" : "primary",
      });
    });
    lots
      .filter((lot) => lot.token)
      .slice(0, 3)
      .forEach((lot) => {
        events.push({
          id: `token-${lot.id}`,
          message: `${lot.external_reference ?? `LOT-${lot.id}`} tokenized with symbol ${lot.token?.token_symbol}.`,
          tone: "emerald",
        });
      });
    return events;
  }, [lots, negotiations]);

  return (
    <div className="space-y-8">
      <DashboardHeader title="Marketplace Explorer" />

      {isLoading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading live marketplace data…
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

          <section className="grid gap-6 xl:grid-cols-[minmax(0,_0.65fr)_minmax(0,_0.35fr)]">
            <Card title="Live Order Book" description="Aggregated from verified lots">
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Lot ID</th>
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3">Volume</th>
                      <th className="px-4 py-3">Price floor</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {orderBook.map((entry) => (
                      <tr key={entry.id} className="transition hover:bg-primary-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{entry.id}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.material}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.volume}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.price}</td>
                        <td className="px-4 py-3 text-primary-600">{entry.status.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3 text-slate-500">{entry.updated}</td>
                      </tr>
                    ))}
                    {orderBook.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          No lots available. Register a producer lot to populate the order book.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Depth" description="Inventory by lifecycle stage">
              <ul className="space-y-3">
                {depth.map((bucket) => (
                  <li key={bucket.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{bucket.label}</span>
                      <span>{bucket.count} lots</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full bg-primary-500 transition-all ${getWidthClass(
                        lots.length ? Math.min(100, (bucket.count / lots.length) * 100) : 0
                      )}`} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="AI Recommendations" description="Portfolio actions to capture spread">
              <Recommendations lots={lots} />
            </Card>

            <Card title="Event Stream" description="Realtime updates from agents and indexer">
              <ul className="space-y-3 text-sm text-slate-600">
                {agentEvents.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                    No recent events. Trigger matchmaking or tokenization to generate updates.
                  </li>
                ) : (
                  agentEvents.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <span className="font-semibold text-primary-600">Event:</span> {event.message}
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

type MarketplaceLot = MarketplaceSnapshot["lots"][number];

function Recommendations({ lots }: { lots: MarketplaceLot[] }) {
  if (!lots || lots.length === 0) {
    return <p className="text-sm text-slate-500">No live lots yet – agents will generate suggestions once inventory is available.</p>;
  }

  const negotiable = lots.filter((lot) => lot.status === "negotiating");
  const verified = lots.filter((lot) => lot.status === "verified");
  const tokenized = lots.filter((lot) => lot.token);

  return (
    <ul className="space-y-3 text-sm text-slate-600">
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {negotiable.length > 0
          ? `${negotiable.length} lot(s) mid-negotiation. Coordinate recycler counter-offers to capture spread.`
          : "No active negotiations. Run matchmaking to populate the book."}
      </li>
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {verified.length > 0
          ? `${verified.length} verified lot(s) ready for tokenization. Prioritize high price floors.`
          : "All verified lots tokenized. Maintain verification cadence."}
      </li>
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {tokenized.length > 0
          ? `${tokenized.length} tokenized lot(s) can be bundled into settlement drops.`
          : "Tokenize verified lots to unlock settlement flow."}
      </li>
    </ul>
  );
}

function getWidthClass(percentage: number) {
  const WIDTH_CLASS_MAP: Record<number, string> = {
    0: "w-0",
    10: "w-[10%]",
    20: "w-[20%]",
    30: "w-[30%]",
    40: "w-[40%]",
    50: "w-1/2",
    60: "w-[60%]",
    70: "w-[70%]",
    80: "w-4/5",
    90: "w-[90%]",
    100: "w-full",
  };

  const clamped = Math.max(0, Math.min(100, Math.round(percentage / 10) * 10));
  return WIDTH_CLASS_MAP[clamped] ?? "w-0";
}
