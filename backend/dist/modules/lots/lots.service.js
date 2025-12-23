import { z } from "zod";
const registerLotSchema = z.object({
    producerId: z.string(),
    materialType: z.string(),
    quantityTons: z.number().positive(),
    location: z.string(),
    priceFloorUsdPerTon: z.number().positive(),
    notes: z.string().optional(),
});
const verificationSchema = z.object({
    method: z.string(),
    verifier: z.string().default("Aura Compliance"),
    notes: z.string().optional(),
});
const tokenizationSchema = z.object({
    symbol: z.string().min(2),
    supply: z.number().int().positive(),
});
export class LotService {
    constructor(db, eventBus, workflow) {
        this.db = db;
        this.eventBus = eventBus;
        this.workflow = workflow;
    }
    registerLot(payload) {
        const dto = registerLotSchema.parse(payload);
        const lot = this.db.createLot({
            producerId: dto.producerId,
            materialType: dto.materialType,
            quantityTons: dto.quantityTons,
            location: dto.location,
            priceFloorUsdPerTon: dto.priceFloorUsdPerTon,
            status: "pending_verification",
        });
        lot.verification = {
            method: "pending",
            verifier: "Aura Compliance",
        };
        this.workflow.scheduleVerification(lot.id);
        return lot;
    }
    listLots() {
        return this.db.lots;
    }
    getLot(id) {
        return this.db.lots.find((lot) => lot.id === id);
    }
    submitVerification(lotId, payload) {
        const dto = verificationSchema.parse(payload);
        const updated = this.db.updateLot(lotId, (lot) => ({
            ...lot,
            status: "verified",
            verification: {
                method: dto.method,
                notes: dto.notes,
                verifier: dto.verifier,
                verifiedAt: new Date().toISOString(),
            },
        }));
        if (!updated) {
            throw new Error(`Lot ${lotId} not found`);
        }
        this.eventBus.emitEvent({ type: "lot.verified", payload: { lotId } });
        return updated;
    }
    tokenizeLot(lotId, payload) {
        const dto = tokenizationSchema.parse(payload);
        const updated = this.db.updateLot(lotId, (lot) => ({
            ...lot,
            status: "tokenized",
            token: {
                tokenId: `${dto.symbol}-${lot.id}`,
                symbol: dto.symbol,
                supply: dto.supply,
                issuedAt: new Date().toISOString(),
            },
        }));
        if (!updated) {
            throw new Error(`Lot ${lotId} not found`);
        }
        return updated;
    }
    findProducerAgents(producerId) {
        return this.db.agents.filter((agent) => agent.type === "producer" && agent.id === producerId);
    }
}
