import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { PagePagination, PagePaginationQuery } from '../../../application/pagination/page.pagination';
import { PaginatedContainer } from '../../../application/pagination/paginated-container.interface';

describe('PagePagination (Integration)', () => {
    @Entity()
    class Person {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        name: string;
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

        await repository.save([
            repository.create({ name: 'John Doe' }),
            repository.create({ name: 'Jane Doe' }),
            repository.create({ name: 'John Smith' }),
            repository.create({ name: 'Kim Book' }),
            repository.create({ name: 'Pol Tree' }),
            repository.create({ name: 'Sam King' }),
        ]);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const query: PagePaginationQuery = { limit: 2, page: 1, path: 'http://example.com/people' };
        const paginator = new PagePagination(qb, query);

        expect(paginator.queryBuilder).toBeDefined();
        expect(paginator.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const query: PagePaginationQuery = { limit: 2, page: 1, path: 'http://example.com/people' };
        const paginator = new PagePagination(repository, query);

        expect(paginator.queryBuilder).toBeDefined();
        expect(paginator.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    describe('#paginate()', () => {
        it('should limit and skip results based on page and limit', async () => {
            const query: PagePaginationQuery = { limit: 2, page: 2, path: 'http://example.com/people' };
            const paginator = new PagePagination(repository, query);

            const result = await paginator.paginate().getMany();

            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toEqual(expect.arrayContaining(['John Smith', 'Kim Book']));
        });
    });

    describe('#toPaginatedContainer()', () => {
        it('should return null for previous link if on the first page', async () => {
            const query: PagePaginationQuery = { limit: 2, page: 1, path: 'http://example.com/people' };
            const paginator = new PagePagination(repository, query);

            const result: PaginatedContainer<Person> = await paginator.toPaginatedContainer();

            expect(result.results).toHaveLength(2);
            expect(result.results.map(p => p.name)).toEqual(expect.arrayContaining(['John Doe', 'Jane Doe']));
            expect(result.count).toBe(6);
            expect(result.next).toBe('http://example.com/people?limit=2&page=2');
            expect(result.previous).toBeNull();
        });

        it('should return null for next link if on the last page', async () => {
            const query: PagePaginationQuery = { limit: 2, page: 3, path: 'http://example.com/people' };
            const paginator = new PagePagination(repository, query);

            const result: PaginatedContainer<Person> = await paginator.toPaginatedContainer();

            expect(result.results).toHaveLength(2);
            expect(result.results.map(p => p.name)).toEqual(expect.arrayContaining(['Pol Tree', 'Sam King']));
            expect(result.count).toBe(6);
            expect(result.next).toBeNull();
            expect(result.previous).toBe('http://example.com/people?limit=2&page=2');
        });

        it('should return paginated results with next and previous links', async () => {
            const query: PagePaginationQuery = { limit: 2, page: 2, path: 'http://example.com/people' };
            const paginator = new PagePagination(repository, query);

            const result: PaginatedContainer<Person> = await paginator.toPaginatedContainer();

            expect(result.results).toHaveLength(2);
            expect(result.results.map(p => p.name)).toEqual(expect.arrayContaining(['John Smith', 'Kim Book']));
            expect(result.count).toBe(6);
            expect(result.next).toBe('http://example.com/people?limit=2&page=3');
            expect(result.previous).toBe('http://example.com/people?limit=2');
        });

        it('should handle single-page results correctly', async () => {
            const query: PagePaginationQuery = { limit: 6, page: 1, path: 'http://example.com/people' };
            const paginator = new PagePagination(repository, query);

            const result: PaginatedContainer<Person> = await paginator.toPaginatedContainer();

            expect(result.results).toHaveLength(6);
            expect(result.count).toBe(6);
            expect(result.next).toBeNull();
            expect(result.previous).toBeNull();
        });
    });
});