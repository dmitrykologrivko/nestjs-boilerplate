import { BaseEntity } from '../../../domain/entities/base.entity';
import { BaseEntityEvent } from '../../../domain/events/base-entity.event';

describe('BaseEntityEvent', () => {
    class TestEntity extends BaseEntity {}

    // tslint:disable-next-line:max-classes-per-file
    class TestEntityEvent extends BaseEntityEvent<TestEntity> {}

    it('test event construction', () => {
        const entity = new TestEntity();
        const event = new TestEntityEvent(entity, TestEntity, TestEntityEvent.name);

        expect(event.data).toBe(entity);
        expect(event.entityCls).toBe(TestEntity);
        expect(event.prefix).toBe(TestEntityEvent.name);
        expect(event.name).toBe(`${TestEntityEvent.name}-${TestEntity.name.toLowerCase()}-entity-event`);
    });

    describe('#getName()', () => {
        it('should return formatted name', () => {
            const name = TestEntityEvent.getName(TestEntity, TestEntityEvent.name);
            expect(name).toBe(`${TestEntityEvent.name}-${TestEntity.name.toLowerCase()}-entity-event`);
        });
    });
});
