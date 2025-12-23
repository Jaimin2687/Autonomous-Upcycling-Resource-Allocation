"use client";

import Link from "next/link";
import { BellIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function DashboardHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">
          Live data sourced from agents, blockchain, and logistics partners.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-primary-600"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-primary-200 hover:text-primary-600"
        >
          <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
          Workspace Settings
        </Link>
      </div>
    </div>
  );
}
