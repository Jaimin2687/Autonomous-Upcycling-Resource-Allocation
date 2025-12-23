import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import LogisticsMap from "@/components/maps/logistics-map";
import { logisticsRoutes } from "@/lib/mock-data";

const logisticsKpis = [
  { title: "Shipments live", value: "18", delta: "4 require action", tone: "warning" as const },
  { title: "On-time rate", value: "96%", delta: "+2 pts", tone: "positive" as const },
  { title: "Carbon intensity", value: "0.72 tCO₂e", delta: "-0.12 vs target", tone: "positive" as const },
  { title: "Autonomous pickups", value: "8", delta: "+3 launched", tone: "positive" as const },
];

export default function LogisticsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Logistics" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {logisticsKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,_0.6fr)_minmax(0,_0.4fr)]">
        <Card title="Route overview" description="Mapbox visualization of live shipments">
          <LogisticsMap />
        </Card>

        <Card title="Route status" description="Priority legs monitored by agents">
          <ul className="space-y-3 text-sm text-slate-600">
            {logisticsRoutes.map((route) => (
              <li key={route.route} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{route.route}</span>
                  <span>{route.status}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Carrier: {route.carrier}</span>
                  <span>ETA: {route.eta}</span>
                </div>
                <p className="mt-1 text-xs text-emerald-600">Emissions: {route.emissions}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Logistics alerts" description="Coordinated by automation plane">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Autonomous pickup #118 paused due to high wind warning. Carrier ETA extended by 40 minutes.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Customs declaration auto-filled for cross-border route Boston ➜ Montreal.
            </li>
            <li className="rounded-xl border border-sate-100 bg-slate-50 px-4 py-3">
              Drone verification requested additional footage for EV battery pallet integrity.
            </li>
          </ul>
        </Card>

        <Card title="Carrier performance" description="Historical SLA tracking">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Evergreen Freight — 98% on-time, <span className="text-emerald-600">Green route eligible</span>.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              ElectroHaul — 94% on-time, <span className="text-primary-600">Requires IoT recalibration</span>.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              NorthStar — 97% on-time, <span className="text-slate-500">Docs pending for cross-border</span>.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
