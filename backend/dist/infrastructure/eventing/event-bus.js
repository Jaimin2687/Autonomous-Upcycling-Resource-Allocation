import { EventEmitter } from "node:events";
export class EventBus extends EventEmitter {
    emitEvent(event) {
        this.emit(event.type, event.payload);
    }
    subscribe(eventName, handler) {
        this.on(eventName, handler);
    }
}
