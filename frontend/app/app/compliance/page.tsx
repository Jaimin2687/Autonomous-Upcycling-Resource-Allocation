import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { complianceLedger, complianceTasks } from "@/lib/mock-data";

const complianceKpis = [
  { title: "Open reviews", value: "9", delta: "3 SLA breaches", tone: "warning" as const },
  { title: "Certificates issued", value: "128", delta: "+14 this month", tone: "positive" as const },
  { title: "AI overrides", value: "6", delta: "Manual review required" },
  { title: "Audit readiness", value: "98%", delta: "Tracking target", tone: "positive" as const },
];

export default function ComplianceDashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Compliance Dashboard" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {complianceKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Review Queue" description="Prioritized by SLA and risk">
          <div className="space-y-3">
            {complianceTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {task.sla}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Owner: {task.owner}</span>
                  <span className="uppercase tracking-wide text-amber-600">{task.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Certificate Ledger" description="Immutable records from Aptos indexer">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Certificate</th>
                  <th className="px-4 py-3">Lot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewer</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {complianceLedger.map((entry) => (
                  <tr key={entry.certificate} className="transition hover:bg-primary-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{entry.certificate}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.lotId}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.status}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.reviewer}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Policy Updates" description="Keep auditors aligned with the latest playbooks">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Updated sampling requirements for mixed-metal lots effective immediately.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Added dual-approval workflow for revoking certificates with escrow active.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Expanded audit scope for EU recyclers to include eIDAS-compliant signatures.
            </li>
          </ul>
        </Card>

        <Card title="Evidence Quality" description="AI scoring vs manual overrides">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Visual evidence acceptable</p>
              <p>92% auto-approved with AI, 6% manual override, 2% rejected.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">IoT telemetry integrity</p>
              <p>All sensor signatures valid over past 72 hours.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Document attestation</p>
              <p>Legal review pending for 3 new recycler agreements.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
