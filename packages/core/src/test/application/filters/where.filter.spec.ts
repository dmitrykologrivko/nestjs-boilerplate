import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    SelectQueryBuilder,
    Repository,
} from 'typeorm';
import { WhereFilter } from '../../../application/filters/where.filter';

describe('WhereFilter (Integration)', () => {
    @Entity()
    class Product {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        name: string;

        @Column()
        price: number;

        @Column({ nullable: true })
        description?: string;
    }

    let dataSource: DataSource;
    let repository: Repository<Product>;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [Product],
        });
        await dataSource.initialize();
        repository = dataSource.getRepository(Product);

        const product1 = repository.create({ name: 'Apple', price: 100, description: 'Fresh fruit' });
        const product2 = repository.create({ name: 'Banana', price: 50, description: 'Yellow fruit' });
        const product3 = repository.create({ name: 'Cherry', price: 75, description: null });

        await repository.save(product1);
        await repository.save(product2);
        await repository.save(product3);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const filter = new WhereFilter(
            qb,
            { where: [['name__eq', 'Apple']] },
            { filterFields: ['name'] }
        );

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const filter = new WhereFilter(
            repository,
            { where: [['name__eq', 'Apple']] },
            { filterFields: ['name'] }
        );

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    it('should throw error if required filter fields are not provided', async () => {
        let isErrorThrown = false;

        try {
            new WhereFilter(repository, { where: [] }, { filterFields: [] });
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Must be provided at least one filter field!');
            isErrorThrown = true;
        }

        expect(isErrorThrown).toBeTruthy();
    });

    describe('#filter()', () => {
        it('should filter by equality', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__eq', 'Apple']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Apple');
        });

        it('should filter by inequality', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__ne', 'Apple']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Banana', 'Cherry']));
        });

        it('should filter by greater than', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['price__gt', '60']] },
                { filterFields: ['price'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.price)).toEqual(expect.arrayContaining([100, 75]));
        });

        it('should filter by less than', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['price__lt', '75']] },
                { filterFields: ['price'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result[0].price).toBe(50);
        });

        it('should filter by greater than or equal', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['price__gte', '75']] },
                { filterFields: ['price'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.price)).toEqual(expect.arrayContaining([100, 75]));
        });

        it('should filter by less than or equal', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['price__lte', '75']] },
                { filterFields: ['price'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.price)).toEqual(expect.arrayContaining([50, 75]));
        });

        it('should filter by starts with', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__starts', 'A']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Apple');
        });

        it('should filter by ends with', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__ends', 'e']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Apple']));
        });

        it('should filter by contains', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__cont', 'err']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Cherry');
        });

        it('should filter by not contains', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__excl', 'Ban']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Apple', 'Cherry']));
        });

        it('should filter by in', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__in', 'Apple,Cherry']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Apple', 'Cherry']));
        });

        it('should filter by not in', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['name__notin', 'Banana']] },
                { filterFields: ['name'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Apple', 'Cherry']));
        });

        it('should filter by is null', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['description__isnull', '']] },
                { filterFields: ['description'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Cherry');
        });

        it('should filter by is not null', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['description__notnull', '']] },
                { filterFields: ['description'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['Apple', 'Banana']));
        });

        it('should filter by between', async () => {
            const filter = new WhereFilter(
                repository,
                { where: [['price__between', '50,100']] },
                { filterFields: ['price'] }
            );

            const result = await filter.filter().getMany();

            expect(result).toHaveLength(3);
            expect(result.map(p => p.price)).toEqual(expect.arrayContaining([50, 75, 100]));
        });
    });
});