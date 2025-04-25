import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { BasePagination } from '../../../application/pagination/base.pagination';
import { BasePaginatedContainer } from '../../../application/pagination/base-paginated-container.interface';

describe('BasePagination (Integration)', () => {
    @Entity()
    class Person {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        name: string;
    }

    interface TestPaginatedContainer extends BasePaginatedContainer<Person> {}

    // tslint:disable-next-line:max-classes-per-file
    class TestPagination extends BasePagination<Person, TestPaginatedContainer> {
        constructor(
            queryBuilderOrRepository: Repository<Person> | SelectQueryBuilder<Person>,
            public readonly limit: number,
        ) {
            super(queryBuilderOrRepository);
        }

        paginate(): SelectQueryBuilder<Person> {
            return this.queryBuilder.take(this.limit);
        }
    }

    let dataSource: DataSource;
    let repository: Repository<Person>;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [Person],
        });
        await dataSource.initialize();
        repository = dataSource.getRepository(Person);

        const person1 = repository.create({ name: 'John Doe' });
        const person2 = repository.create({ name: 'Jane Doe' });
        const person3 = repository.create({ name: 'John Smith' });

        await repository.save([person1, person2, person3]);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const paginator = new TestPagination(qb, 1);

        expect(paginator.queryBuilder).toBeDefined();
        expect(paginator.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const paginator = new TestPagination(repository, 1);

        expect(paginator.queryBuilder).toBeDefined();
        expect(paginator.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    describe('#paginate()', () => {
        it('should limit the number of results', async () => {
            const queryBuilder = repository.createQueryBuilder('person');

            const paginator = new TestPagination(queryBuilder, 2);
            const result = await paginator.paginate().getMany();

            expect(result).toHaveLength(2);
        });
    });

    describe('#toPaginatedContainer()', () => {
        it('should return paginated results', async () => {
            const queryBuilder = repository.createQueryBuilder('person');

            const paginator = new TestPagination(queryBuilder, 2);
            const result = await paginator.toPaginatedContainer();

            expect(result.results).toHaveLength(2);
        });
    });
});
