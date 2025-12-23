"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { NavigationSection } from "@/lib/navigation";

interface DashboardSidebarProps {
  navigation: NavigationSection[];
}

export default function DashboardSidebar({ navigation }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/70 p-6 backdrop-blur lg:block">
      <div className="space-y-8">
        {navigation.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "group flex flex-col rounded-xl border border-transparent px-4 py-3 transition",
                      isActive
                        ? "border-primary-200 bg-primary-50"
                        : "hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm font-semibold",
                        isActive ? "text-primary-600" : "text-slate-700 group-hover:text-primary-600"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                    {item.badge ? (
                      <span className="mt-2 w-fit rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
