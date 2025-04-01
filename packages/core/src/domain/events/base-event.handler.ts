import { BaseEvent } from './base.event';

export abstract class BaseEventHandler<T extends BaseEvent, U> {

    /**
     * The event class that this handler supports
     */
    abstract supports(): string[];

    /**
     * Handle the event
     * @param event
     * @param unitOfWork
     * @throws EventFailedException
     */
    abstract handle(event: T, unitOfWork?: U): Promise<void>;

}
