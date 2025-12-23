import { addHours } from "date-fns";

import { EventBus } from "./event-bus";

interface WorkflowTask {
  id: string;
  type: "verification" | "shipment" | "certification";
  scheduledAt: Date;
  metadata: Record<string, unknown>;
}

export class WorkflowEngine {
  private readonly tasks: WorkflowTask[] = [];

  constructor(private readonly eventBus: EventBus) {}

  scheduleVerification(lotId: string): void {
    this.createTask("verification", { lotId }, 1);
  }

  scheduleShipment(shipmentId: string): void {
    this.createTask("shipment", { shipmentId }, 0.5);
  }

  scheduleCertification(certificationId: string): void {
    this.createTask("certification", { certificationId }, 2);
  }

  listTasks(): WorkflowTask[] {
    return [...this.tasks];
  }

  private createTask(type: WorkflowTask["type"], metadata: Record<string, unknown>, offsetHours: number): void {
    const task: WorkflowTask = {
      id: `${type}-${Math.random().toString(36).slice(2, 10)}`,
      type,
      scheduledAt: addHours(new Date(), offsetHours),
      metadata,
    };
    this.tasks.push(task);
    if (type === "verification") {
      this.eventBus.emitEvent({ type: "lot.registered", payload: { lotId: metadata.lotId as string } });
    } else if (type === "shipment") {
      this.eventBus.emitEvent({
        type: "shipment.scheduled",
        payload: { shipmentId: metadata.shipmentId as string },
      });
    } else {
      this.eventBus.emitEvent({
        type: "certification.requested",
        payload: { certificationId: metadata.certificationId as string },
      });
    }
  }
}
