import DashboardHeader from "@/components/layout/dashboard-header";
import Card from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Workspace Settings" />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Organization" description="Tenant-wide configuration">
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Tenant name</p>
              <p className="text-lg font-semibold text-slate-900">AURA Pilot Consortium</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Default timezone</p>
              <p className="text-lg font-semibold text-slate-900">UTC</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Default locale</p>
              <p className="text-lg font-semibold text-slate-900">en-US</p>
            </div>
          </div>
        </Card>

        <Card title="Authentication" description="Wallet and SSO policies">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Wallet whitelist includes Petra, Martian, and WalletConnect profiles.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              SSO enforced via SAML with Just-In-Time provisioning.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Passwordless login fallback via verified email links.
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Notifications" description="Multi-channel alerts">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Email digest scheduled daily at 08:00 in each timezone.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Pager escalation triggered for compliance SLA breaches.
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Slack integration active for negotiation updates.
            </li>
          </ul>
        </Card>

        <Card title="Integrations" description="External systems linked to the workspace">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Aptos indexer endpoint — https://indexer.aura.dev
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Backend BFF — https://api.aura.dev
            </li>
            <li className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              Feature flag service — LaunchDarkly (env: pilot)
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
