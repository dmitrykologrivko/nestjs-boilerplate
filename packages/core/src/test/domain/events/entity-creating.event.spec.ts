import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityCreatingEvent } from '../../../domain/events/entity-creating.event';

describe('EntityCreatingEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityCreatingEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityCreatingEvent.PREFIX);
        expect(event.name).toBe(`${EntityCreatingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityCreatingEvent.getName(TestEntity);
            expect(name).toBe(`${EntityCreatingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
