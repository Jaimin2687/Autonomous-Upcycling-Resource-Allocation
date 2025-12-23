"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Agent,
  MarketplaceSnapshot,
  Negotiation,
  WasteLotDetail,
  approveVerification,
  createWasteLot,
  fetchAgents,
  fetchMarketplaceSnapshot,
  fetchNegotiations,
  fetchProducer,
  fetchProducers,
  fetchWasteLot,
  fetchWasteLots,
  finalizeNegotiation,
  runMatchmaking,
  submitTokenization,
  submitVerification,
  type ProducerDetail,
  type ProducerSummary,
} from "@/lib/api-client";

const SNAPSHOT_KEY = ["snapshot"];
const WASTE_LOTS_KEY = ["waste-lots"];
const NEGOTIATIONS_KEY = ["negotiations"];
const PRODUCERS_KEY = ["producers"];
const AGENTS_KEY = ["agents"];

export function useMarketplaceSnapshot() {
  return useQuery<MarketplaceSnapshot>({
    queryKey: SNAPSHOT_KEY,
    queryFn: fetchMarketplaceSnapshot,
    refetchInterval: 30_000,
  });
}

export function useWasteLots(options?: { status?: string }) {
  return useQuery<WasteLotDetail[]>({
    queryKey: [...WASTE_LOTS_KEY, options?.status ?? "all"],
    queryFn: () => fetchWasteLots(options),
    refetchInterval: 20_000,
  });
}

export function useWasteLot(lotId: number) {
  return useQuery<WasteLotDetail>({
    queryKey: [...WASTE_LOTS_KEY, lotId],
    queryFn: () => fetchWasteLot(lotId),
    enabled: Number.isFinite(lotId),
    refetchInterval: 15_000,
  });
}

export function useNegotiations() {
  return useQuery<Negotiation[]>({
    queryKey: NEGOTIATIONS_KEY,
    queryFn: fetchNegotiations,
    refetchInterval: 20_000,
  });
}

export function useAgents(agentType?: "producer" | "recycler") {
  return useQuery<Agent[]>({
    queryKey: [...AGENTS_KEY, agentType ?? "all"],
    queryFn: () => fetchAgents(agentType),
    refetchInterval: 45_000,
  });
}

export function useProducers() {
  return useQuery<ProducerSummary[]>({
    queryKey: PRODUCERS_KEY,
    queryFn: fetchProducers,
    refetchInterval: 60_000,
  });
}

export function useProducerDetail(producerId: number | undefined) {
  return useQuery<ProducerDetail>({
    queryKey: ["producer", producerId],
    queryFn: () => fetchProducer(producerId!),
    enabled: !!producerId,
  });
}

export function useMatchmakingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runMatchmaking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
      queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_KEY });
    },
  });
}

export function useNegotiationDecisionMutation(negotiationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { agree: boolean; counter_offer_usd_per_ton?: number }) =>
      finalizeNegotiation(negotiationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEGOTIATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
      queryClient.invalidateQueries({ queryKey: WASTE_LOTS_KEY });
    },
  });
}

export function useTokenizeLotMutation(lotId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { token_name: string; token_symbol: string; supply: number; token_address?: string; transaction_hash?: string }) =>
      submitTokenization(lotId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
      queryClient.invalidateQueries({ queryKey: WASTE_LOTS_KEY });
    },
  });
}

export function useSubmitVerificationMutation(lotId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitVerification.bind(null, lotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WASTE_LOTS_KEY });
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
    },
  });
}

export function useApproveVerificationMutation(lotId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveVerification.bind(null, lotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WASTE_LOTS_KEY });
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
    },
  });
}

export function useCreateLotMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWasteLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WASTE_LOTS_KEY });
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY });
    },
  });
}
