import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityDestroyingEvent } from '../../../domain/events/entity-destroying.event';

describe('EntityDestroyingEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityDestroyingEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityDestroyingEvent.PREFIX);
        expect(event.name).toBe(`${EntityDestroyingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityDestroyingEvent.getName(TestEntity);
            expect(name).toBe(`${EntityDestroyingEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
