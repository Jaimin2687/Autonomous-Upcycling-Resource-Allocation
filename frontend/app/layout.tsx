import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import SiteHeader from "@/components/layout/site-header";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AURA Platform",
    template: "%s | AURA Platform",
  },
  description:
    "Command center for autonomous upcycling, negotiations, and compliance verification.",
  metadataBase: new URL("https://aura.local"),
  openGraph: {
    title: "AURA Platform",
    description:
      "Command center for autonomous upcycling, negotiations, and compliance verification.",
    siteName: "AURA Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA Platform",
    description:
      "Command center for autonomous upcycling, negotiations, and compliance verification.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}> 
        <Providers>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
