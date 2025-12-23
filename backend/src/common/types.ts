export type WasteLotStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "tokenized"
  | "negotiating"
  | "settled"
  | "upcycling_pending"
  | "upcycling_validated"
  | "retired";

export interface WasteLot {
  id: string;
  producerId: string;
  materialType: string;
  quantityTons: number;
  location: string;
  priceFloorUsdPerTon: number;
  status: WasteLotStatus;
  createdAt: string;
  updatedAt: string;
  verification?: Verification;
  token?: TokenizedAsset;
}

export interface Verification {
  method: string;
  notes?: string;
  verifiedAt?: string;
  verifier: string;
}

export interface TokenizedAsset {
  tokenId: string;
  symbol: string;
  supply: number;
  issuedAt: string;
  retiredAt?: string;
}

export type AgentType = "producer" | "recycler" | "compliance" | "logistics";

export interface Agent {
  id: string;
  owner: string;
  type: AgentType;
  contactEmail?: string;
  strategy: AgentStrategy;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStrategy {
  buyFloor?: number;
  buyCeiling?: number;
  targetMargin?: number;
  responseSLAHours?: number;
  bundlePreference?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceOffer {
  id: string;
  lotId: string;
  producerAgentId: string;
  recyclerAgentId: string;
  status: "open" | "counter" | "accepted" | "rejected";
  producerOffer?: number;
  recyclerOffer?: number;
  agreedPrice?: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  lotId: string;
  carrier: string;
  scheduledPickup: string;
  status: "scheduled" | "in_transit" | "delivered";
  trackerUrl?: string;
}

export interface CertificationRequest {
  id: string;
  lotId: string;
  submittedBy: string;
  submittedAt: string;
  evidenceUri: string;
  status: "pending" | "approved" | "rejected";
  reviewer?: string;
  reviewedAt?: string;
  notes?: string;
  certificateUri?: string;
}

export interface ESGSummary {
  lotsTokenized: number;
  lotsRetired: number;
  totalTonnage: number;
  averagePricePerTon: number;
  pendingShipments: number;
}

export interface RepositoryState {
  lots: WasteLot[];
  agents: Agent[];
  offers: MarketplaceOffer[];
  shipments: Shipment[];
  certifications: CertificationRequest[];
}
