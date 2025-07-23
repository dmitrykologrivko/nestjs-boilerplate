import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    SelectQueryBuilder,
    Repository,
} from 'typeorm';
import { OrderingFilter } from '../../../application/filters/ordering.filter';

describe('OrderingFilter (Integration)', () => {
    @Entity()
    class Product {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        name: string;

        @Column()
        price: number;
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

        const product1 = repository.create({ name: 'Apple', price: 100 });
        const product2 = repository.create({ name: 'Banana', price: 50 });
        const product3 = repository.create({ name: 'Cherry', price: 75 });

        await repository.save(product1);
        await repository.save(product2);
        await repository.save(product3);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const filter = new OrderingFilter(qb, { sortBy: [] }, { orderingFields: ['name'] });

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const filter = new OrderingFilter(repository, { sortBy: [] }, { orderingFields: ['name'] });

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    it('should throw error if required ordering fields are not provided', async () => {
        let isErrorThrown = false;

        try {
            // tslint:disable-next-line:no-unused-expression
            new OrderingFilter(repository, { sortBy: [] }, { orderingFields: [] });
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Must be provided at least one ordering field!');
            isErrorThrown = true;
        }

        expect(isErrorThrown).toBeTruthy();
    });

    describe('#filter()', () => {
        it('should order by name in ascending order', async () => {
            let result = await repository.find();

            expect(result).toHaveLength(3);

            const filter = new OrderingFilter(repository, { sortBy: ['name'] }, { orderingFields: ['name'] });

            const qb = filter.filter();

            result = await qb.getMany();

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('Apple');
            expect(result[1].name).toBe('Banana');
            expect(result[2].name).toBe('Cherry');
        });

        it('should order by price in descending order', async () => {
            const filter = new OrderingFilter(repository, { sortBy: ['-price'] }, { orderingFields: ['price'] });

            const qb = filter.filter();

            const result = await qb.getMany();

            expect(result).toHaveLength(3);
            expect(result[0].price).toBe(100);
            expect(result[1].price).toBe(75);
            expect(result[2].price).toBe(50);
        });

        it('should use default ordering if no sortBy is provided', async () => {
            const filter = new OrderingFilter(
                repository,
                { sortBy: [] },
                { orderingFields: ['price'], defaultOrdering: ['-price'] }
            );

            const qb = filter.filter();

            const result = await qb.getMany();

            expect(result).toHaveLength(3);
            expect(result[0].price).toBe(100);
            expect(result[1].price).toBe(75);
            expect(result[2].price).toBe(50);
        });
    });
});
