import type { ReactNode } from "react";

import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import { dashboardNavigation } from "@/lib/navigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <DashboardSidebar navigation={dashboardNavigation} />
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
