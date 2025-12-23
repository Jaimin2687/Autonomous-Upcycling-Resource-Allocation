const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
type FetcherOptions = RequestInit & { parseJson?: boolean };

async function apiFetch<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { parseJson = true, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body || response.statusText}`);
  }

  if (!parseJson) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export async function fetchMarketplaceSnapshot() {
  return apiFetch<MarketplaceSnapshot>("/snapshot");
}

export async function fetchWasteLots(params?: { status?: string }) {
  const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return apiFetch<WasteLotDetail[]>(`/lots${query}`);
}

export async function fetchWasteLot(lotId: number) {
  return apiFetch<WasteLotDetail>(`/lots/${lotId}`);
}

export async function fetchNegotiations() {
  return apiFetch<Negotiation[]>("/negotiations");
}

export async function fetchAgents(agentType?: string) {
  const query = agentType ? `?agent_type=${encodeURIComponent(agentType)}` : "";
  return apiFetch<Agent[]>(`/agents${query}`);
}

export async function fetchProducers() {
  return apiFetch<ProducerSummary[]>("/producers");
}

export async function fetchProducer(producerId: number) {
  return apiFetch<ProducerDetail>(`/producers/${producerId}`);
}

export async function runMatchmaking() {
  return apiFetch<Negotiation[]>("/agents/matchmaking", { method: "POST" });
}

export async function finalizeNegotiation(
  negotiationId: number,
  payload: { agree: boolean; counter_offer_usd_per_ton?: number }
) {
  return apiFetch<Negotiation>(`/negotiations/${negotiationId}/decision`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitTokenization(
  lotId: number,
  payload: {
    token_name: string;
    token_symbol: string;
    supply: number;
    token_address?: string;
    transaction_hash?: string;
  }
) {
  return apiFetch<WasteLotDetail>(`/lots/${lotId}/tokenize`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitVerification(
  lotId: number,
  payload: {
    method: string;
    evidence_uri?: string;
    sensor_checksum?: string;
    verifier_notes?: string;
    mark_verified?: boolean;
  }
) {
  return apiFetch<WasteLotDetail>(`/lots/${lotId}/verification`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveVerification(
  lotId: number,
  payload?: {
    verifier_notes?: string;
  }
) {
  return apiFetch<WasteLotDetail>(`/lots/${lotId}/verify`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function createWasteLot(payload: {
  producer_id: number;
  material_type: string;
  quantity_tons: number;
  location: string;
  price_floor_usd_per_ton?: number;
  external_reference?: string;
  chemical_composition?: Record<string, unknown>;
  photos?: string[];
}) {
  return apiFetch<WasteLotDetail>("/lots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type MarketplaceSnapshot = {
  generated_at: string;
  lots: (WasteLotDetail & { producer: string })[];
  agents: Array<{
    id: number;
    owner: string;
    type: string;
    strategy: Record<string, unknown>;
  }>;
};

export type ProducerSummary = {
  id: number;
  name: string;
  contact_email: string;
  organization_type?: string | null;
  aptos_address?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProducerDetail = ProducerSummary & {
  lots: WasteLot[];
  agents: Agent[];
};

export type WasteLot = {
  id: number;
  producer_id: number;
  material_type: string;
  quantity_tons: number;
  location: string;
  price_floor_usd_per_ton?: number | null;
  external_reference?: string | null;
  chemical_composition: Record<string, unknown>;
  photos: string[];
  status: string;
  created_at: string;
  updated_at: string;
};

export type WasteLotVerification = {
  id: number;
  status: string;
  method: string;
  evidence_uri?: string | null;
  sensor_checksum?: string | null;
  verifier_notes?: string | null;
  requested_at: string;
  verified_at?: string | null;
};

export type WasteLotToken = {
  id: number;
  token_address: string;
  token_name: string;
  token_symbol: string;
  supply: number;
  transaction_hash?: string | null;
  minted_at: string;
  retired_at?: string | null;
  retire_transaction_hash?: string | null;
};

export type UpcyclingProof = {
  id: number;
  waste_lot_id: number;
  recycler_agent_id?: number | null;
  evidence_uri?: string | null;
  sensor_checksum?: string | null;
  processing_notes?: string | null;
  ai_confidence?: number | null;
  status: string;
  certificate_uri?: string | null;
  submitted_at: string;
  validated_at?: string | null;
};

export type WasteLotDetail = WasteLot & {
  token?: WasteLotToken | null;
  verification?: WasteLotVerification | null;
  proofs: UpcyclingProof[];
};

export type Agent = {
  id: number;
  agent_identifier: string;
  agent_type: "producer" | "recycler" | string;
  owner_name: string;
  owner_contact?: string | null;
  producer_id?: number | null;
  target_price_usd_per_ton?: number | null;
  max_price_usd_per_ton?: number | null;
  deadline_hours?: number | null;
  radius_miles?: number | null;
  auto_negotiate?: boolean | null;
  bundle_preference?: boolean | null;
  strategy_metadata: Record<string, unknown>;
  last_heartbeat_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type Negotiation = {
  id: number;
  waste_lot_id: number;
  producer_agent_id: number;
  recycler_agent_id: number;
  status: string;
  producer_offer_usd_per_ton?: number | null;
  recycler_offer_usd_per_ton?: number | null;
  agreed_price_usd_per_ton?: number | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};
