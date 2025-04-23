import { BaseEntity } from '../../../domain/entities/base.entity';
import { EntityDestroyedEvent } from '../../../domain/events/entity-destroyed.event';

describe('EntityDestroyedEvent', () => {
    class TestEntity extends BaseEntity {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new EntityDestroyedEvent<TestEntity>(entity, TestEntity);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(EntityDestroyedEvent.PREFIX);
        expect(event.name).toBe(`${EntityDestroyedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = EntityDestroyedEvent.getName(TestEntity);
            expect(name).toBe(`${EntityDestroyedEvent.PREFIX}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
