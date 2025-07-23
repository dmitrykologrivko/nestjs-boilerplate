import {
    EntitySwappableService,
    getTargetEntity,
    getTargetName,
} from '../../database/entity-swappable.service';

describe('EntitySwappableService', () => {
    class TestEntity {}
    // tslint:disable-next-line:max-classes-per-file
    class SwappableEntity {}

    beforeEach(async () => EntitySwappableService.clear());
    afterEach(async () => EntitySwappableService.clear());

    describe('#allowSwappable()', () => {
        it('should allow an entity to be swappable', () => {
            EntitySwappableService.allowSwappable(TestEntity);

            const allowedEntities = EntitySwappableService.allowedEntities;
            expect(allowedEntities.has(TestEntity.name)).toBe(true);
        });
    });

    describe('#swapEntity()', () => {
        it('should swap an entity when it is allowed', () => {
            EntitySwappableService.allowSwappable(TestEntity);
            EntitySwappableService.swapEntity(TestEntity, SwappableEntity);

            const swappableEntities = EntitySwappableService.swappableEntities;
            expect(swappableEntities.get(TestEntity.name)).toBe(SwappableEntity);
        });

        it('should throw an error when swapping an entity that is not allowed', () => {
            expect(() => {
                EntitySwappableService.swapEntity(TestEntity, SwappableEntity);
            }).toThrow('TestEntity is not allowed to be swapped');
        });
    });

    describe('#findSwappable()', () => {
        it('should find the correct swappable entity', () => {
            EntitySwappableService.allowSwappable(TestEntity);
            EntitySwappableService.swapEntity(TestEntity, SwappableEntity);

            const result = EntitySwappableService.findSwappable(TestEntity);
            expect(result).toBe(SwappableEntity);
        });

        it('should return undefined if no swappable entity is found', () => {
            const result = EntitySwappableService.findSwappable(TestEntity);
            expect(result).toBeUndefined();
        });
    });

    describe('#clear()', () => {
        it('should clear all allowed and swappable entities', () => {
            EntitySwappableService.allowSwappable(TestEntity);
            EntitySwappableService.swapEntity(TestEntity, SwappableEntity);

            EntitySwappableService.clear();

            expect(EntitySwappableService.allowedEntities.size).toBe(0);
            expect(EntitySwappableService.swappableEntities.size).toBe(0);
        });
    });
});

describe('#getTargetName()', () => {
    beforeEach(async () => EntitySwappableService.clear());
    afterEach(async () => EntitySwappableService.clear());

    // tslint:disable-next-line:max-classes-per-file
    class TestEntity {}

    // tslint:disable-next-line:max-classes-per-file
    class SwappableEntity {}

    it('should return target entity name', () => {
        expect(getTargetName(TestEntity)).toBe(TestEntity.name);
    });

    it('should return swappable entity name', () => {
        EntitySwappableService.allowSwappable(TestEntity);
        EntitySwappableService.swapEntity(TestEntity, SwappableEntity);

        expect(getTargetName(TestEntity)).toBe(SwappableEntity.name);
    });
});

describe('#getTargetEntity()', () => {
    beforeEach(async () => EntitySwappableService.clear());
    afterEach(async () => EntitySwappableService.clear());

    // tslint:disable-next-line:max-classes-per-file
    class TestEntity {}

    // tslint:disable-next-line:max-classes-per-file
    class SwappableEntity {}

    it('should return target entity name', () => {
        expect(getTargetEntity(TestEntity)).toBe(TestEntity);
    });

    it('should return swappable entity name', () => {
        EntitySwappableService.allowSwappable(TestEntity);
        EntitySwappableService.swapEntity(TestEntity, SwappableEntity);

        expect(getTargetEntity(TestEntity)).toBe(SwappableEntity);
    });
});
