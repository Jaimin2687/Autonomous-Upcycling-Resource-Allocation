"use client";

import { useEffect, useMemo, useState } from "react";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import ThroughputChart from "@/components/charts/throughput-chart";
import {
  useApproveVerificationMutation,
  useNegotiations,
  useProducers,
  useSubmitVerificationMutation,
  useTokenizeLotMutation,
  useWasteLots,
} from "@/hooks/useMarketplaceData";
import { useWallet } from "@/providers/wallet-provider";
import type { WasteLotDetail } from "@/lib/api-client";

function stageLabel(status: string) {
  return status.replace(/_/g, " ");
}

function lotSupportsTokenization(lot: WasteLotDetail) {
  return lot.status === "verified" && !lot.token;
}

function lotNeedsVerification(lot: WasteLotDetail) {
  return lot.status === "pending_verification" && !lot.verification;
}

export default function ProducerConsolePage() {
  const { data: producers, isLoading: producersLoading } = useProducers();
  const [selectedProducerId, setSelectedProducerId] = useState<number | undefined>();
  const activeProducerId = selectedProducerId ?? producers?.[0]?.id;
  const activeProducer = producers?.find((item) => item.id === activeProducerId);

  useEffect(() => {
    if (!selectedProducerId && producers && producers.length > 0) {
      setSelectedProducerId(producers[0].id);
    }
  }, [producers, selectedProducerId]);

  const { data: lots, isLoading: lotsLoading } = useWasteLots();
  const { data: negotiations } = useNegotiations();

  const producerLots = useMemo(
    () => (lots ?? []).filter((lot) => lot.producer_id === activeProducerId),
    [lots, activeProducerId]
  );

  const kpis = useMemo(() => {
    const pending = producerLots.filter((lot) => lotNeedsVerification(lot)).length;
    const negotiating = producerLots.filter((lot) => lot.status === "negotiating").length;
    const tokenized = producerLots.filter((lot) => lot.token).length;
    const total = producerLots.length;

    return [
      {
        title: "Lots in pipeline",
        value: total.toString(),
        delta: `${negotiating} in negotiation`,
        tone: total ? "positive" as const : "neutral" as const,
      },
      {
        title: "Pending verification",
        value: pending.toString(),
        delta: pending ? "Action required" : "All up to date",
        tone: pending ? "warning" as const : "positive" as const,
      },
      {
        title: "Tokenized lots",
        value: tokenized.toString(),
        delta: `${total ? Math.round((tokenized / total) * 100) : 0}% coverage`,
        tone: tokenized ? "positive" as const : "neutral" as const,
      },
      {
        title: "Active negotiations",
        value: (negotiations ?? []).filter((neg) => producerLots.some((lot) => lot.id === neg.waste_lot_id)).length.toString(),
        delta: "Scoped to this producer",
        tone: "neutral" as const,
      },
    ];
  }, [negotiations, producerLots]);

  const throughputData = useMemo(() => {
    const bucket = new Map<string, { tons: number; revenue: number }>();
    producerLots.forEach((lot) => {
      const created = new Date(lot.created_at);
      const key = `${created.getFullYear()}-${created.getMonth() + 1}`;
      const entry = bucket.get(key) ?? { tons: 0, revenue: 0 };
      entry.tons += lot.quantity_tons;
      entry.revenue += (lot.price_floor_usd_per_ton ?? 0) * lot.quantity_tons;
      bucket.set(key, entry);
    });

    return Array.from(bucket.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: date.toLocaleString(undefined, { month: "short" }),
          tons: Math.round(value.tons),
          revenue: Math.round(value.revenue / 1000),
        };
      });
  }, [producerLots]);

  const loading = producersLoading || lotsLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DashboardHeader title="Producer Console" />
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500" htmlFor="producer-select">
            Producer
          </label>
          <select
            id="producer-select"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:outline-none"
            value={activeProducerId ?? ""}
            onChange={(event) => setSelectedProducerId(Number(event.target.value))}
          >
            {(producers ?? []).map((producer) => (
              <option key={producer.id} value={producer.id}>
                {producer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading producer context…
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

          <LotPipeline lots={producerLots} producerName={activeProducer?.name ?? ""} />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,_0.6fr)_minmax(0,_0.4fr)]">
            <Card title="Throughput" description="Tokenized tons and settlement revenue per month">
              <ThroughputChart data={throughputData.length > 0 ? throughputData : [{ month: "-", tons: 0, revenue: 0 }]} />
            </Card>

            <Card title="Agent Suggestions" description="Prioritized actions to accelerate settlements">
              <AgentSuggestions lots={producerLots} />
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function LotPipeline({ lots, producerName }: { lots: WasteLotDetail[]; producerName: string }) {
  if (!lots.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        No lots registered for {producerName || "this producer"} yet. Create a lot via the API or agent runner to see live data.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Lot Pipeline</h2>
          <p className="text-sm text-slate-500">Track AI agent negotiations, verification, and tokenization progress.</p>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Lot</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Price floor</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lots.map((lot) => (
              <LotRow key={lot.id} lot={lot} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LotRow({ lot }: { lot: WasteLotDetail }) {
  const verifyMutation = useSubmitVerificationMutation(lot.id);
  const approveMutation = useApproveVerificationMutation(lot.id);
  const { mutateAsync: tokenizeAsync, isPending: isTokenizing } = useTokenizeLotMutation(lot.id);
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [isSigning, setSigning] = useState(false);

  const handleRequestVerification = () => {
    verifyMutation.mutate({ method: "ai_inspection", mark_verified: true });
  };

  const handleApproveVerification = () => {
    approveMutation.mutate({ verifier_notes: "Manual override" });
  };

  const handleTokenize = async () => {
    const tokenName = `${lot.material_type} Lot ${lot.id}`;
    const tokenSymbol = `LOT${lot.id}`;
    const supply = 1;
    try {
      if (!connected || !account || !signAndSubmitTransaction) {
        throw new Error("Connect an Aptos wallet to tokenize this lot.");
      }

      setSigning(true);
      const moduleAddress = process.env.NEXT_PUBLIC_AURA_MODULE_ADDRESS ?? "0xa11ce";
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${moduleAddress}::waste_lot::tokenize_lot`,
          functionArguments: [String(lot.id), tokenSymbol, supply],
        },
      });

      await tokenizeAsync({
        token_name: tokenName,
        token_symbol: tokenSymbol,
        supply,
        transaction_hash: response.hash,
      });
    } catch (error) {
      console.error("Tokenization failed", error);
    } finally {
      setSigning(false);
    }
  };

  return (
    <tr className="transition hover:bg-primary-50/40">
      <td className="px-4 py-3 font-semibold text-slate-900">{lot.external_reference ?? `LOT-${lot.id}`}</td>
      <td className="px-4 py-3 text-slate-600">{lot.material_type}</td>
      <td className="px-4 py-3 text-slate-600">{stageLabel(lot.status)}</td>
      <td className="px-4 py-3 text-slate-600">
        {lot.price_floor_usd_per_ton ? `$${lot.price_floor_usd_per_ton.toFixed(2)} / ton` : "TBD"}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {lot.verification ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <DocumentCheckIcon className="h-4 w-4" aria-hidden="true" /> Verified
          </span>
        ) : (
          "Pending"
        )}
      </td>
      <td className="px-4 py-3 text-slate-600">{lot.token ? lot.token.token_symbol : "—"}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {lotNeedsVerification(lot) ? (
            <button
              type="button"
              onClick={handleRequestVerification}
              disabled={verifyMutation.isPending}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Submit verification
            </button>
          ) : null}
          {lot.verification && !lot.token ? (
            <button
              type="button"
              onClick={handleApproveVerification}
              disabled={approveMutation.isPending}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Approve
            </button>
          ) : null}
          {lotSupportsTokenization(lot) ? (
            <button
              type="button"
              onClick={handleTokenize}
              disabled={isTokenizing || isSigning}
              className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSigning || isTokenizing ? "Tokenizing…" : "Tokenize"}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function AgentSuggestions({ lots }: { lots: WasteLotDetail[] }) {
  if (!lots.length) {
    return <p className="text-sm text-slate-500">No suggestions yet – add lots to generate agent recommendations.</p>;
  }

  const pending = lots.filter(lotNeedsVerification);
  const tokenizable = lots.filter(lotSupportsTokenization);
  const negotiating = lots.filter((lot) => lot.status === "negotiating");

  return (
    <ul className="space-y-3 text-sm text-slate-600">
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {pending.length > 0
          ? `${pending.length} lot(s) need additional evidence or verifier approval.`
          : "Verification queue is clear. Maintain sensor coverage for new lots."}
      </li>
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {tokenizable.length > 0
          ? `${tokenizable.length} verified lot(s) ready for tokenization. Trigger settlement once minted.`
          : "No lots awaiting tokenization."}
      </li>
      <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        {negotiating.length > 0
          ? `${negotiating.length} lot(s) under negotiation. Review counter-offers before expiry.`
          : "Run matchmaking to spin up new buyer negotiations."}
      </li>
    </ul>
  );
}
