import { addMinutes } from "date-fns";
import { randomUUID } from "node:crypto";
export class MemoryDatabase {
    constructor(seed) {
        this.state = {
            lots: [],
            agents: [],
            offers: [],
            shipments: [],
            certifications: [],
            ...seed,
        };
        if (!seed) {
            this.seedDefaults();
        }
    }
    get lots() {
        return this.state.lots;
    }
    get agents() {
        return this.state.agents;
    }
    get offers() {
        return this.state.offers;
    }
    get shipments() {
        return this.state.shipments;
    }
    get certifications() {
        return this.state.certifications;
    }
    createLot(partial) {
        const now = new Date().toISOString();
        const lot = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...partial,
        };
        this.state.lots.push(lot);
        return lot;
    }
    updateLot(id, updater) {
        const index = this.state.lots.findIndex((lot) => lot.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = updater(this.state.lots[index]);
        this.state.lots[index] = { ...updated, updatedAt: new Date().toISOString() };
        return this.state.lots[index];
    }
    upsertAgent(agent) {
        const now = new Date().toISOString();
        const existingIndex = agent.id ? this.state.agents.findIndex((a) => a.id === agent.id) : -1;
        if (existingIndex >= 0) {
            const next = {
                ...this.state.agents[existingIndex],
                ...agent,
                updatedAt: now,
            };
            this.state.agents[existingIndex] = next;
            return next;
        }
        const created = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...agent,
        };
        this.state.agents.push(created);
        return created;
    }
    createOffer(partial) {
        const now = new Date();
        const offer = {
            id: randomUUID(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            expiresAt: addMinutes(now, 120).toISOString(),
            ...partial,
        };
        this.state.offers.push(offer);
        return offer;
    }
    updateOffer(id, updater) {
        const index = this.state.offers.findIndex((offer) => offer.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = updater(this.state.offers[index]);
        this.state.offers[index] = { ...updated, updatedAt: new Date().toISOString() };
        return this.state.offers[index];
    }
    createShipment(partial) {
        const shipment = {
            id: randomUUID(),
            ...partial,
        };
        this.state.shipments.push(shipment);
        return shipment;
    }
    createCertification(partial) {
        const certification = {
            id: randomUUID(),
            submittedAt: new Date().toISOString(),
            ...partial,
        };
        this.state.certifications.push(certification);
        return certification;
    }
    updateCertification(id, updater) {
        const index = this.state.certifications.findIndex((cert) => cert.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = updater(this.state.certifications[index]);
        this.state.certifications[index] = updated;
        return updated;
    }
    updateAgentStrategy(id, strategy) {
        const agent = this.state.agents.find((item) => item.id === id);
        if (!agent) {
            return undefined;
        }
        agent.strategy = { ...agent.strategy, ...strategy };
        agent.updatedAt = new Date().toISOString();
        return agent;
    }
    seedDefaults() {
        const now = new Date().toISOString();
        this.state.agents.push({
            id: randomUUID(),
            owner: "GreenCircuit Labs",
            type: "producer",
            contactEmail: "ops@greencircuit.example",
            strategy: { targetMargin: 0.15, responseSLAHours: 6 },
            createdAt: now,
            updatedAt: now,
        }, {
            id: randomUUID(),
            owner: "HyperPoly Upcycling",
            type: "recycler",
            contactEmail: "trade@hyperpoly.example",
            strategy: { buyCeiling: 280, responseSLAHours: 4 },
            createdAt: now,
            updatedAt: now,
        }, {
            id: randomUUID(),
            owner: "Aura Compliance",
            type: "compliance",
            contactEmail: "audit@aura.example",
            strategy: { metadata: { approvalsPerDay: 20 } },
            createdAt: now,
            updatedAt: now,
        });
        const lot = this.createLot({
            producerId: this.state.agents[0].id,
            materialType: "Lithium-ion Batteries",
            quantityTons: 12,
            location: "Austin, TX",
            priceFloorUsdPerTon: 320,
            status: "pending_verification",
        });
        lot.verification = {
            method: "document_upload",
            verifier: "Aura Compliance",
        };
        this.createOffer({
            lotId: lot.id,
            producerAgentId: this.state.agents[0].id,
            recyclerAgentId: this.state.agents[1].id,
            status: "open",
            producerOffer: 410,
            recyclerOffer: 360,
        });
    }
}
