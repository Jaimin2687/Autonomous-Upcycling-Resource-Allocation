export const missionControlKpis = [
  {
    title: "Active Negotiations",
    value: "42",
    delta: "+12% vs 24h",
    tone: "positive" as const,
  },
  {
    title: "Certified Tons",
    value: "1,280",
    delta: "+7% vs target",
    tone: "positive" as const,
  },
  {
    title: "Settlement Volume",
    value: "$218K",
    delta: "$25K pending",
    tone: "neutral" as const,
  },
  {
    title: "Logistics SLA",
    value: "96%",
    delta: "2 delayed pickups",
    tone: "warning" as const,
  },
];

export const negotiationTimeline = [
  {
    id: "neg-221",
    lot: "Aluminum Dross",
    producer: "BrightAlloy",
    recycler: "CircularMetals",
    status: "Countered",
    lastUpdate: "12 mins ago",
  },
  {
    id: "neg-219",
    lot: "EV Battery Cathodes",
    producer: "ElectraVolt",
    recycler: "NeoLith",
    status: "Awaiting AI Review",
    lastUpdate: "21 mins ago",
  },
  {
    id: "neg-214",
    lot: "Food Waste - Tier 1",
    producer: "UrbanHarvest",
    recycler: "BioCycle",
    status: "Logistics Routing",
    lastUpdate: "38 mins ago",
  },
];

export const marketplaceOrders = [
  {
    id: "LOT-0192",
    material: "High-density plastics",
    volume: "52 tons",
    price: "$412 / ton",
    agentSignal: "Favorable",
    eta: "5 days",
  },
  {
    id: "LOT-0178",
    material: "Lithium scrap",
    volume: "14 tons",
    price: "$1,950 / ton",
    agentSignal: "Competitive",
    eta: "Negotiation",
  },
  {
    id: "LOT-0159",
    material: "Organic fiber mix",
    volume: "38 tons",
    price: "$260 / ton",
    agentSignal: "Watch",
    eta: "3 days",
  },
];

export const complianceTasks = [
  {
    id: "COMP-882",
    title: "Review AI evidence -> LOT-0178",
    owner: "Auditor Team",
    sla: "4h",
    risk: "medium",
  },
  {
    id: "COMP-879",
    title: "Approve certificate retirement",
    owner: "Compliance Ops",
    sla: "12h",
    risk: "low",
  },
  {
    id: "COMP-870",
    title: "Investigate sensor anomaly",
    owner: "IoT Reliability",
    sla: "2h",
    risk: "high",
  },
];

export const producerLots = [
  {
    id: "LOT-0192",
    material: "Mixed Plastics",
    stage: "Negotiation",
    pledgedPrice: "$410 / ton",
    aiConfidence: 0.88,
    documents: 8,
  },
  {
    id: "LOT-0193",
    material: "EV Battery Assemblies",
    stage: "Evidence Review",
    pledgedPrice: "$2,120 / ton",
    aiConfidence: 0.73,
    documents: 11,
  },
  {
    id: "LOT-0187",
    material: "Aluminum Extrusions",
    stage: "Settlement",
    pledgedPrice: "$980 / ton",
    aiConfidence: 0.94,
    documents: 5,
  },
];

export const recyclerMatches = [
  {
    id: "RM-447",
    material: "PET Flake",
    destination: "CircularPlast",
    strategy: "Aggressive",
    score: 92,
    eta: "6h",
  },
  {
    id: "RM-443",
    material: "Lithium Shards",
    destination: "VoltLoop",
    strategy: "Moderate",
    score: 88,
    eta: "14h",
  },
  {
    id: "RM-440",
    material: "Food Waste BIO",
    destination: "ReGenBio",
    strategy: "Eco",
    score: 79,
    eta: "4h",
  },
];

export const analyticsTrend = [
  { month: "Jan", tons: 420, revenue: 110 },
  { month: "Feb", tons: 510, revenue: 138 },
  { month: "Mar", tons: 562, revenue: 152 },
  { month: "Apr", tons: 610, revenue: 165 },
  { month: "May", tons: 702, revenue: 190 },
  { month: "Jun", tons: 760, revenue: 214 },
];

export const complianceLedger = [
  {
    certificate: "CERT-00128",
    lotId: "LOT-0187",
    status: "Issued",
    reviewer: "AI + Human",
    timestamp: "2024-06-19",
  },
  {
    certificate: "CERT-00127",
    lotId: "LOT-0175",
    status: "Pending Retirement",
    reviewer: "AI",
    timestamp: "2024-06-17",
  },
  {
    certificate: "CERT-00126",
    lotId: "LOT-0172",
    status: "Revoked",
    reviewer: "Compliance Ops",
    timestamp: "2024-06-14",
  },
];

export const adminExperiments = [
  {
    name: "Predictive Pricing",
    owner: "Marketplace",
    stage: "Beta",
    population: "18%",
  },
  {
    name: "Auto-KYC",
    owner: "Onboarding",
    stage: "Live",
    population: "100%",
  },
  {
    name: "Green Route Optimizer",
    owner: "Logistics",
    stage: "Ramp",
    population: "42%",
  },
];

export const logisticsRoutes = [
  {
    route: "Seattle ➜ Reno",
    carrier: "Evergreen Freight",
    status: "In-transit",
    eta: "3h 22m",
    emissions: "0.8 tCO₂e",
  },
  {
    route: "Austin ➜ Phoenix",
    carrier: "ElectroHaul",
    status: "Dispatching",
    eta: "5h 10m",
    emissions: "0.6 tCO₂e",
  },
  {
    route: "Boston ➜ Montreal",
    carrier: "NorthStar",
    status: "Awaiting Docs",
    eta: "Pending",
    emissions: "0.3 tCO₂e",
  },
];

export const deviceInventory = [
  {
    id: "CAM-102",
    site: "LA MRF",
    status: "Online",
    signal: "4.8 / 5",
    lastSeen: "2m ago",
  },
  {
    id: "SCALE-77",
    site: "Austin Plant",
    status: "Maintenance",
    signal: "--",
    lastSeen: "18m ago",
  },
  {
    id: "SENSOR-420",
    site: "Seattle Port",
    status: "Online",
    signal: "4.4 / 5",
    lastSeen: "5m ago",
  },
];

export const reportCatalog = [
  {
    name: "Monthly ESG Impact",
    type: "ESG",
    format: "PDF",
    generated: "2024-06-01",
  },
  {
    name: "Negotiation Performance",
    type: "Revenue",
    format: "CSV",
    generated: "2024-06-18",
  },
  {
    name: "Compliance Audit Trail",
    type: "Compliance",
    format: "JSON",
    generated: "2024-06-12",
  },
];
