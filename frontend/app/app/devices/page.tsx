import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";
import KpiCard from "@/components/ui/kpi-card";
import { deviceInventory } from "@/lib/mock-data";

const deviceKpis = [
  { title: "Devices online", value: "86", delta: "+4 restored", tone: "positive" as const },
  { title: "Maintenance", value: "6", delta: "2 overdue", tone: "warning" as const },
  { title: "Telemetry uptime", value: "99.2%", delta: "-0.4 pts" },
  { title: "Sensor anomalies", value: "3", delta: "AI triage running", tone: "warning" as const },
];

export default function DevicesPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Devices & IoT" />

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {deviceKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Device inventory" description="Real-time state from telemetry layer">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Signal</th>
                  <th className="px-4 py-3">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {deviceInventory.map((device) => (
                  <tr key={device.id} className="transition hover:bg-primary-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-900">{device.id}</td>
                    <td className="px-4 py-3 text-slate-600">{device.site}</td>
                    <td className="px-4 py-3 text-slate-600">{device.status}</td>
                    <td className="px-4 py-3 text-slate-600">{device.signal}</td>
                    <td className="px-4 py-3 text-slate-600">{device.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Anomaly feed" description="AI-detected issues requiring human attention">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Scale drift detected at Austin plant. Recalibration workflow triggered.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Camera CAM-102 flagged low-light variance; switching to HDR fallback.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Sensor-420 reported humidity spike; dispatching maintenance drone.
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Maintenance schedule" description="Coordinated with operations plane">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              BioCycle facility — calibrate spectroscopy sensors (due in 3h).
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              UrbanHarvest site — replace conveyor thermal camera (scheduled tonight).
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              CircularMetals — install firmware patch for emission monitors.
            </li>
          </ul>
        </Card>

        <Card title="Firmware rollouts" description="Staged deployment waves">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Wave 1 (20 devices) rolled out — monitoring telemetry for regressions.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Wave 2 scheduled after compliance sign-off.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Emergency rollback plan validated with carrier partners.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
