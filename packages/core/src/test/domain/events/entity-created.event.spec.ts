import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityCreatedEvent } from '../../../domain/events/entity-created.event';

describe('EntityCreatedEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityCreatedEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityCreatedEvent.PREFIX);
        expect(event.name).toBe(`${EntityCreatedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityCreatedEvent.getName(TestEntity);
            expect(name).toBe(`${EntityCreatedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
