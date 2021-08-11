import { Result } from '../../utils/monads/result';
import { BaseEvent } from './base.event';
import { EventFailedException } from './event-failed.exception';

export abstract class BaseEventHandler<T extends BaseEvent, U> {

    abstract supports(): string[];

    abstract handle(event: T, unitOfWork?: U): Promise<Result<void, EventFailedException>>;

}
