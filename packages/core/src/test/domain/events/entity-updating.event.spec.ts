import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityUpdatingEvent } from '../../../domain/events/entity-updating.event';

describe('EntityUpdatingEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityUpdatingEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityUpdatingEvent.PREFIX);
        expect(event.name).toBe(`${EntityUpdatingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityUpdatingEvent.getName(TestEntity);
            expect(name).toBe(`${EntityUpdatingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
