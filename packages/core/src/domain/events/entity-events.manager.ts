import { Injectable } from '@nestjs/common';
import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { EventBus } from './event-bus.util';
import { EntityCreatedEvent } from './entity-created.event';
import { EntityCreatingEvent } from './entity-creating.event';
import { EntityUpdatedEvent } from './entity-updated.event';
import { EntityUpdatingEvent } from './entity-updating.event';
import { EntityDestroyedEvent } from './entity-destroyed.event';
import { EntityDestroyingEvent } from './entity-destroying.event';

@Injectable()
export class EntityEventsManager<E extends BaseEntity, U> {

    constructor(
        private eventBus: EventBus,
    ) {}

    /**
     * Called when an entity is created.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @throws EventsFailedException
     */
    async onCreatedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<void> {
        return this.eventBus.publish(new EntityCreatedEvent(entity, entityCls));
    }

    /**
     * Called when an entity is being created.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @param unitOfWork Unit of work
     * @throws EventsFailedException
     */
    async onCreatingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<void> {
        return this.eventBus.publish(new EntityCreatingEvent(entity, entityCls), unitOfWork);
    }

    /**
     * Called when an entity is updated.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @throws EventsFailedException
     */
    async onUpdatedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<void> {
        return this.eventBus.publish(new EntityUpdatedEvent(entity, entityCls));
    }

    /**
     * Called when an entity is being updated.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @param unitOfWork Unit of work
     * @throws EventsFailedException
     */
    async onUpdatingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<void> {
        return this.eventBus.publish(new EntityUpdatingEvent(entity, entityCls), unitOfWork);
    }

    /**
     * Called when an entity is destroyed.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @throws EventsFailedException
     */
    async onDestroyedEntity(
        entity: E,
        entityCls: Constructor<E>,
    ): Promise<void> {
        return this.eventBus.publish(new EntityDestroyedEvent(entity, entityCls));
    }

    /**
     * Called when an entity is being destroyed.
     * @param entity Entity instance
     * @param entityCls Entity class
     * @param unitOfWork Unit of work
     * @throws EventsFailedException
     */
    async onDestroyingEntity(
        entity: E,
        entityCls: Constructor<E>,
        unitOfWork?: U,
    ): Promise<void> {
        return this.eventBus.publish(new EntityDestroyingEvent(entity, entityCls), unitOfWork);
    }
}
