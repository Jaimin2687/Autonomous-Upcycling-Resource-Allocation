import { addHours } from "date-fns";
export class WorkflowEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.tasks = [];
    }
    scheduleVerification(lotId) {
        this.createTask("verification", { lotId }, 1);
    }
    scheduleShipment(shipmentId) {
        this.createTask("shipment", { shipmentId }, 0.5);
    }
    scheduleCertification(certificationId) {
        this.createTask("certification", { certificationId }, 2);
    }
    listTasks() {
        return [...this.tasks];
    }
    createTask(type, metadata, offsetHours) {
        const task = {
            id: `${type}-${Math.random().toString(36).slice(2, 10)}`,
            type,
            scheduledAt: addHours(new Date(), offsetHours),
            metadata,
        };
        this.tasks.push(task);
        if (type === "verification") {
            this.eventBus.emitEvent({ type: "lot.registered", payload: { lotId: metadata.lotId } });
        }
        else if (type === "shipment") {
            this.eventBus.emitEvent({
                type: "shipment.scheduled",
                payload: { shipmentId: metadata.shipmentId },
            });
        }
        else {
            this.eventBus.emitEvent({
                type: "certification.requested",
                payload: { certificationId: metadata.certificationId },
            });
        }
    }
}
