import { Injectable } from '@nestjs/common';
import { BaseEvent } from './base.event';
import { BaseEventHandler } from './base-event.handler';
import { EventFailedException } from './event-failed.exception';
import { EventsFailedException } from './events-failed.exception';

@Injectable()
export class EventBus {

    private handlers: BaseEventHandler<any, any>[];

    constructor() {
        this.handlers = [];
    }

    registerHandler(handler: BaseEventHandler<any, any>) {
        this.handlers.push(handler);
    }

    unregisterHandler(handler: BaseEventHandler<any, any>) {
        this.handlers = this.handlers.filter(value => value !== handler);
    }

    unregisterAll(eventName?: string) {
        if (eventName) {
            this.handlers = this.handlers.filter(
                handler => handler.supports()?.includes(eventName)
            );
            return;
        }
        this.handlers = [];
    }

    /**
     * Publish an event to all registered handlers
     * @param event
     * @param unitOfWork
     * @throws EventsFailedException
     */
    async publish<U>(event: BaseEvent, unitOfWork?: U): Promise<void> {
        const container: EventsFailedException = new EventsFailedException();

        for (const handler of this.handlers) {
            if (handler.supports()?.includes(event.name)) {
                // The EventBus handles all handlers even if any of them return/throw an exception
                try {
                    const result = await handler.handle(event, unitOfWork);
                } catch(e) {
                    container.add(new EventFailedException(e));
                }
            }
        }

        if (container.length() > 0) {
            throw container;
        }

        return null;
    }
}
