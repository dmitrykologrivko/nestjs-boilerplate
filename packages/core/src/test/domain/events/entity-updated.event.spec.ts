import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityUpdatedEvent } from '../../../domain/events/entity-updated.event';

describe('EntityUpdatedEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityUpdatedEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityUpdatedEvent.PREFIX);
        expect(event.name).toBe(`${EntityUpdatedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityUpdatedEvent.getName(TestEntity);
            expect(name).toBe(`${EntityUpdatedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
