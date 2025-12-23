import Link from "next/link";
import { AdjustmentsHorizontalIcon, SparklesIcon } from "@heroicons/react/24/outline";
import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { recyclerMatches } from "@/lib/mock-data";

const recyclerKpis = [
  { title: "Matches queued", value: "12", delta: "3 require response", tone: "warning" as const },
  { title: "Average premium", value: "+8.2%", delta: "+1.4 vs last week", tone: "positive" as const },
  { title: "Wallet escrow", value: "8,420 APT", delta: "Settlement pipeline: 2,180 APT" },
  { title: "Recovery rate", value: "92%", delta: "+3% vs target", tone: "positive" as const },
];

export default function RecyclerConsolePage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Recycler Console" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recyclerKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Agent Match Feed"
          description="Sorted by recycler strategy and AI score"
          action={
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-600"
            >
              Adjust filters
              <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Strategy</th>
                  <th className="px-4 py-3">AI score</th>
                  <th className="px-4 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recyclerMatches.map((match) => (
                  <tr key={match.id} className="transition hover:bg-primary-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{match.id}</td>
                    <td className="px-4 py-3 text-slate-600">{match.material}</td>
                    <td className="px-4 py-3 text-slate-600">{match.destination}</td>
                    <td className="px-4 py-3 text-slate-600">{match.strategy}</td>
                    <td className="px-4 py-3 text-primary-600">{match.score}</td>
                    <td className="px-4 py-3 text-slate-600">{match.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Strategy Insights" description="Ai copilots summarizing negotiating stance and risk">
          <ul className="space-y-3">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Aggressive strategy outperforming</p>
              <p>High recovery odds for PET Flake. Recommend locking in premium within 4 hours.</p>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Moderate strategy requires logistics buffer</p>
              <p>Carrier availability is tight for lithium routes. Expand window by 6 hours to prevent SLA breaches.</p>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Eco strategy trending up</p>
              <p>Demand for bio feedstock increasing. Consider dynamic pricing module.</p>
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Agent configuration"
          description="Tweak negotiation parameters on the fly"
          action={
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-200 hover:text-primary-600"
            >
              Launch playground
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Target premium</p>
              <p className="text-lg font-semibold text-slate-900">+7.5%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Risk tolerance</p>
              <p className="text-lg font-semibold text-slate-900">Balanced</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Negotiation tempo</p>
              <p className="text-lg font-semibold text-slate-900">Adaptive</p>
            </div>
          </div>
        </Card>

        <Card title="Logistics commitments" description="Real-time commitments shared with carriers">
          <ul className="space-y-3">
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">ElectroHaul</p>
                <p className="text-xs text-slate-500">Austin ➜ Phoenix • 18 tons</p>
              </div>
              <span className="text-sm font-semibold text-primary-600">Awaiting pickup</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">NorthStar</p>
                <p className="text-xs text-slate-500">Boston ➜ Montreal • 9 tons</p>
              </div>
              <span className="text-sm font-semibold text-emerald-600">Confirmed</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">BioRoute</p>
                <p className="text-xs text-slate-500">Seattle ➜ Portland • 13 tons</p>
              </div>
              <span className="text-sm font-semibold text-amber-600">Docs pending</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
