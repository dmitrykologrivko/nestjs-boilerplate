import { Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../utils/monads/result';
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

    async publish<U>(event: BaseEvent, unitOfWork?: U): Promise<Result<void, EventsFailedException>> {
        let container: EventsFailedException = new EventsFailedException();
        
        for (const handler of this.handlers) {
            if (handler.supports()?.includes(event.name)) {
                // The EventBus handles all handlers even if any of them return/throw an exception
                try {
                    const result = await handler.handle(event, unitOfWork);
                    if (result.isErr()) {
                        container.add(result.unwrapErr());
                    }
                } catch(e) {
                    container.add(new EventFailedException(e));
                }
            }
        }

        if (container.lenght() > 0) {
            return err(container);
        }

        return ok(null);
    }
}
