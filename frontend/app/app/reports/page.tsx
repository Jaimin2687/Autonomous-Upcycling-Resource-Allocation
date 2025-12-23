import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { reportCatalog } from "@/lib/mock-data";

const reportsKpis = [
  { title: "Reports generated", value: "42", delta: "+6 this week", tone: "positive" as const },
  { title: "Scheduled exports", value: "12", delta: "3 pending" },
  { title: "API pulls", value: "238", delta: "+18% vs last week", tone: "positive" as const },
  { title: "Data destinations", value: "7", delta: "Snowflake, BQ, S3 live" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Reports & Exports" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {reportsKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Report catalog" description="Latest exports across personas">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reportCatalog.map((report) => (
                  <tr key={report.name} className="transition hover:bg-primary-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{report.name}</td>
                    <td className="px-4 py-3 text-slate-600">{report.type}</td>
                    <td className="px-4 py-3 text-slate-600">{report.format}</td>
                    <td className="px-4 py-3 text-slate-600">{report.generated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Automation" description="CI/CD and downstream syncs">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Warehouse sync pipeline succeeded 8 mins ago.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              PowerBI refresh triggered after compliance certificate issuance.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              API token rotation scheduled for Monday across partner integrations.
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Destinations" description="Active export targets and SLAs">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Snowflake (prod) — 15 min SLA — <span className="text-emerald-600">Healthy</span>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              BigQuery (analytics) — hourly exports — <span className="text-emerald-600">Healthy</span>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              S3 (compliance) — nightly archive — <span className="text-primary-600">Processing</span>
            </li>
          </ul>
        </Card>

        <Card title="Manual requests" description="Ad-hoc downloads from users">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Auditor requested raw sensor traces for LOT-0182.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Recycler CFO exported revenue projections for Q3 planning.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Admin downloaded agent policy diffs post-deployment.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
