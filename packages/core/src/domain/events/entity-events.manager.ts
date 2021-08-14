import { Injectable } from '@nestjs/common';
import { Constructor } from '../../utils/type.utils';
import { Result } from '../../utils/monads/result';
import { BaseEntity } from '../entities/base.entity';
import { EventBus } from './event-bus.util';
import { EntityCreatedEvent } from './entity-created.event';
import { EntityCreatingEvent } from './entity-creating.event';
import { EntityUpdatedEvent } from './entity-updated.event';
import { EntityUpdatingEvent } from './entity-updating.event';
import { EntityDestroyedEvent } from './entity-destroyed.event';
import { EntityDestroyingEvent } from './entity-destroying.event';
import { EventsFailedException } from './events-failed.exception';

@Injectable()
export class EntityEventsManager<E extends BaseEntity, U> {

    constructor(
        private eventBus: EventBus,
    ) {}

    async onCreatedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityCreatedEvent(entity, entityCls));
    }

    async onCreatingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityCreatingEvent(entity, entityCls), unitOfWork);
    }

    async onUpdatedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityUpdatedEvent(entity, entityCls));
    }

    async onUpdatingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityUpdatingEvent(entity, entityCls), unitOfWork);
    }

    async onDestroyedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityDestroyedEvent(entity, entityCls));
    }

    async onDestroyingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<Result<void, EventsFailedException>> {
        return this.eventBus.publish(new EntityDestroyingEvent(entity, entityCls), unitOfWork);
    }
}
