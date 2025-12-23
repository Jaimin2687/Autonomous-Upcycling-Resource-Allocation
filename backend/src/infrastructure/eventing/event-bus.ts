import { EventEmitter } from "node:events";

export type DomainEvent =
  | { type: "lot.registered"; payload: { lotId: string } }
  | { type: "lot.verified"; payload: { lotId: string } }
  | { type: "offer.created"; payload: { offerId: string } }
  | { type: "shipment.scheduled"; payload: { shipmentId: string } }
  | { type: "certification.requested"; payload: { certificationId: string } };

export class EventBus extends EventEmitter {
  emitEvent(event: DomainEvent): void {
    this.emit(event.type, event.payload);
  }

  subscribe<TPayload>(eventName: DomainEvent["type"], handler: (payload: TPayload) => void): void {
    this.on(eventName, handler as (payload: unknown) => void);
  }
}
