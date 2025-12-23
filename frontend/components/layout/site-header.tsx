"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import WalletConnectButton from "@/components/wallet/wallet-connect-button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Console" },
  { href: "/app/marketplace", label: "Marketplace" },
  { href: "/app/compliance", label: "Compliance" },
  { href: "/docs", label: "Docs" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Image src="/logo.svg" alt="AURA" width={32} height={32} priority />
          </div>
          <Bars3Icon className="h-6 w-6 text-primary-500 md:hidden" aria-hidden="true" />
          <Link href="/" className="text-lg font-semibold text-slate-900">
            AURA Platform
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-2 transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "hover:text-primary-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <WalletConnectButton />
          <Link
            href="/app"
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
          >
            Launch Console
          </Link>
        </div>
      </div>
    </header>
  );
}
