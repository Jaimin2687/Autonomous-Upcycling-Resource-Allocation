import Link from "next/link";
import {
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const pillars = [
  {
    title: "Autonomous Negotiations",
    description:
      "Agent-powered matching engine discovers optimal recycler partnerships and pricing in real time.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Verifiable Upcycling",
    description:
      "Every waste lot is tokenized on Aptos with AI-assisted evidence verification and immutable certificates.",
    icon: ArrowTrendingUpIcon,
  },
  {
    title: "Operational Intelligence",
    description:
      "Unified dashboards track logistics, compliance tasks, emissions savings, and financial impact.",
    icon: ArrowTopRightOnSquareIcon,
  },
];

const personas = [
  {
    name: "Producers",
    summary: "Register lots, launch agent negotiations, monitor payout timelines.",
    href: "/app/producer",
  },
  {
    name: "Recyclers",
    summary: "Discover upstream material, tune strategies, coordinate logistics.",
    href: "/app/recycler",
  },
  {
    name: "Auditors",
    summary: "Streamline verification pipelines and manage certificate issuance.",
    href: "/app/compliance",
  },
  {
    name: "Administrators",
    summary: "Control access, feature flags, billing, and ecosystem policy.",
    href: "/app/admin",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-slate-100">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                Autonomous Upcycling Command Center
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Orchestrate waste valorization with <span className="text-primary-600">AURA Agents</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Unify negotiations, logistics, compliance, and blockchain settlements in a single pane of glass.
                AURA automates the upcycling lifecycle while keeping humans-in-the-loop.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/app"
                  className="rounded-full bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition hover:-translate-y-0.5 hover:bg-primary-500"
                >
                  Launch Pilot Console
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 text-base font-semibold text-primary-600 hover:text-primary-500"
                >
                  View Platform Blueprint
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Live Metrics</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Testnet
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Active Negotiations</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">42</p>
                      <p className="text-xs text-emerald-600">+12% vs last 24h</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Certified Tons</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">1,280</p>
                      <p className="text-xs text-primary-600">+7% vs target</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Aptos Settlement</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">$218K</p>
                      <p className="text-xs text-slate-500">Rolling 30-days</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Logistics SLAs</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">96%</p>
                      <p className="text-xs text-emerald-600">On-time pickups</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 hidden h-32 w-32 rounded-full bg-primary-200/40 blur-2xl lg:block" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <pillar.icon className="h-8 w-8 text-primary-500" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="text-sm text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold text-slate-900">Role-specific workspaces</h2>
            <p className="max-w-3xl text-base text-slate-600">
              Tailored surfaces bring the right telemetry and controls to each persona while keeping negotiations,
              logistics, and compliance tightly orchestrated.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona) => (
              <Link
                key={persona.name}
                href={persona.href}
                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary-300"
              >
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary-600">{persona.name}</p>
                  <p className="text-sm text-slate-600">{persona.summary}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                  Explore workspace
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
