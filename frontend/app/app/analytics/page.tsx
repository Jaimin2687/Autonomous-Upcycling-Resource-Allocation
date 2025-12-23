import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import ThroughputChart from "@/components/charts/throughput-chart";
import { analyticsTrend } from "@/lib/mock-data";

const analyticsKpis = [
  { title: "Net tons upcycled", value: "760", delta: "+9% vs target", tone: "positive" as const },
  { title: "Revenue captured", value: "$214K", delta: "+14% vs last month", tone: "positive" as const },
  { title: "Avg margin", value: "18.4%", delta: "+1.1 pts" },
  { title: "Carbon avoided", value: "2,480 tCO₂e", delta: "+320 vs goal", tone: "positive" as const },
];

const cohortBreakdown = [
  { cohort: "Producers tier 1", lots: 24, revenue: "$92K" },
  { cohort: "Recyclers premium", lots: 19, revenue: "$74K" },
  { cohort: "Logistics partners", lots: 31, revenue: "$48K" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Analytics" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {analyticsKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,_0.65fr)_minmax(0,_0.35fr)]">
        <Card title="Throughput" description="Tons processed and revenue captured per month">
          <ThroughputChart data={analyticsTrend} />
        </Card>

        <Card title="Cohort performance" description="Compare impacts across tenant segments">
          <ul className="space-y-3 text-sm text-slate-600">
            {cohortBreakdown.map((row) => (
              <li key={row.cohort} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{row.cohort}</span>
                  <span>{row.revenue}</span>
                </div>
                <p className="text-xs text-slate-500">{row.lots} lots settled</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="ESG Savings" description="Emission avoidance and water conservation">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Greenhouse gas avoidance</p>
              <p>2,480 tCO₂e avoided, equivalent to 540 cars off the road.</p>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Water savings</p>
              <p>12.8M liters saved through closed-loop processing.</p>
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="font-semibold text-slate-900">Energy efficiency</p>
              <p>Agents optimized routes to reduce 18% of idle time.</p>
            </li>
          </ul>
        </Card>

        <Card title="Data Export" description="Sync results into BI tools">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Snowflake sync completed 5 mins ago.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              BigQuery export scheduled nightly at 02:00 UTC.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              PowerBI dashboard refresh triggered by webhook events.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
