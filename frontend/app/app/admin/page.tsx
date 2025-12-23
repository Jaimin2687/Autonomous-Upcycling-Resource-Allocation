import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { adminExperiments } from "@/lib/mock-data";

const adminKpis = [
  { title: "Active tenants", value: "142", delta: "+12 this month", tone: "positive" as const },
  { title: "Feature flags", value: "28", delta: "5 in beta" },
  { title: "SLO status", value: "99.8%", delta: "Healthy", tone: "positive" as const },
  { title: "Agent fleets", value: "64", delta: "+8 launched", tone: "positive" as const },
];

export default function AdminControlPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Admin Control Center" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Experiments" description="Progress of feature flags across tenants">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Experiment</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Population</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {adminExperiments.map((experiment) => (
                  <tr key={experiment.name} className="transition hover:bg-primary-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{experiment.name}</td>
                    <td className="px-4 py-3 text-slate-600">{experiment.owner}</td>
                    <td className="px-4 py-3 text-slate-600">{experiment.stage}</td>
                    <td className="px-4 py-3 text-slate-600">{experiment.population}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Governance" description="Operational levers for fleet and billing">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Upcoming governance vote to expand treasury distribution automation.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              New billing plan for high-frequency agent usage goes live next sprint.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Feature flag &ldquo;Predictive Pricing&rdquo; gating access to AI-managed negotiation strategies.
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Tenant Health" description="SLOs and dependency status">
          <ul className="space-y-3">
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">Realtime APIs</span>
              <span className="text-sm font-semibold text-emerald-600">Operational</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">Aptos Indexer</span>
              <span className="text-sm font-semibold text-emerald-600">Operational</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">Agentic Loop</span>
              <span className="text-sm font-semibold text-amber-600">Degraded latency</span>
            </li>
          </ul>
        </Card>

        <Card title="Security & Access" description="Recent admin actions">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              New auditor role created for Compliance Ops.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              API key rotation scheduled for Marketplace service.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Added SSO support for recycler partners with SCIM provisioning.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
