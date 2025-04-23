import { MockProxy, mock } from 'jest-mock-extended';
import { EntityEventsManager } from '../../../domain/events/entity-events.manager';
import { EventBus } from '../../../domain/events/event-bus.util';
import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityCreatedEvent } from '../../../domain/events/entity-created.event';
import { EntityCreatingEvent } from '../../../domain/events/entity-creating.event';
import { EntityUpdatedEvent } from '../../../domain/events/entity-updated.event';
import { EntityUpdatingEvent } from '../../../domain/events/entity-updating.event';
import { EntityDestroyedEvent } from '../../../domain/events/entity-destroyed.event';
import { EntityDestroyingEvent } from '../../../domain/events/entity-destroying.event';

describe('EntityEventsManager', () => {
    class TestEntity extends BaseEntity<number> {}

    let eventBusMock: MockProxy<EventBus>;
    let manager: EntityEventsManager<TestEntity, unknown>;

    beforeEach(() => {
        eventBusMock = mock<EventBus>();
        manager = new EntityEventsManager<TestEntity, unknown>(eventBusMock);
    });

    describe('#onCreatedEntity()', () => {
        it('should publish EntityCreatedEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;

            await manager.onCreatedEntity(entity, entityCls);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityCreatedEvent));
            const event = eventBusMock.publish.mock.calls[0][0] as EntityCreatedEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });

    describe('#onCreatingEntity()', () => {
        it('should publish EntityCreatingEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;
            const unitOfWork = {};

            await manager.onCreatingEntity(entity, entityCls, unitOfWork);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityCreatingEvent), unitOfWork);
            const event = eventBusMock.publish.mock.calls[0][0] as EntityCreatingEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });

    describe('#onUpdatedEntity()', () => {
        it('should publish EntityUpdatedEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;

            await manager.onUpdatedEntity(entity, entityCls);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityUpdatedEvent));
            const event = eventBusMock.publish.mock.calls[0][0] as EntityUpdatedEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });

    describe('#onUpdatingEntity()', () => {
        it('should publish EntityUpdatingEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;
            const unitOfWork = {};

            await manager.onUpdatingEntity(entity, entityCls, unitOfWork);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityUpdatingEvent), unitOfWork);
            const event = eventBusMock.publish.mock.calls[0][0] as EntityUpdatingEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });

    describe('#onDestroyedEntity()', () => {
        it('should publish EntityDestroyedEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;

            await manager.onDestroyedEntity(entity, entityCls);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityDestroyedEvent));
            const event = eventBusMock.publish.mock.calls[0][0] as EntityDestroyedEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });

    describe('#onDestroyingEntity()', () => {
        it('should publish EntityDestroyingEvent', async () => {
            const entity = new TestEntity();
            const entityCls = TestEntity;
            const unitOfWork = {};

            await manager.onDestroyingEntity(entity, entityCls, unitOfWork);

            expect(eventBusMock.publish).toHaveBeenCalledWith(expect.any(EntityDestroyingEvent), unitOfWork);
            const event = eventBusMock.publish.mock.calls[0][0] as EntityDestroyingEvent<TestEntity>;
            expect(event.data).toBe(entity);
            expect(event.entityCls).toBe(entityCls);
        });
    });
});
