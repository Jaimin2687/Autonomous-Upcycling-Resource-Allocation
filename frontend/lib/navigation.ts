export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const dashboardNavigation: NavigationSection[] = [
  {
    title: "Core Workflows",
    items: [
      { href: "/app", label: "Mission Control", description: "Unified operations overview" },
      { href: "/app/producer", label: "Producer Console", description: "Lot registry and AI negotiations" },
      { href: "/app/recycler", label: "Recycler Console", description: "Material discovery and logistics" },
      { href: "/app/marketplace", label: "Marketplace Explorer", description: "Real-time order book" },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/app/compliance", label: "Compliance Dashboard", description: "Certificates and audits" },
      { href: "/app/admin", label: "Admin Control", description: "Access, plans, feature flags" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/app/analytics", label: "Analytics", description: "ESG impact, financials" },
      { href: "/app/logistics", label: "Logistics", description: "Shipment orchestration" },
      { href: "/app/devices", label: "Devices & IoT", description: "Sensor health and streams", badge: "IoT" },
      { href: "/app/reports", label: "Reports", description: "Exports and compliance packets" },
    ],
  },
];
