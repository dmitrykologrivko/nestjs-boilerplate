import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    SelectQueryBuilder, Repository,
} from 'typeorm';
import { SearchFilter } from '../../../application/filters/search.filter';

describe('SearchFilter (Integration)', () => {
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

        const person1 = repository.create({ name: 'John Doe' });
        const person2 = repository.create({ name: 'Jane Doe' });
        const person3 = repository.create({ name: 'John Smith' });

        await repository.save(person1);
        await repository.save(person2);
        await repository.save(person3);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const filter = new SearchFilter(qb, { search: '' }, { searchFields: ['name'] });

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const filter = new SearchFilter(repository, { search: '' }, { searchFields: ['name'] });

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    it('should throw error if required search fields are not provided', async () => {
        let isErrorThrown = false;

        try {
            // tslint:disable-next-line:no-unused-expression
            new SearchFilter(repository, { search: '' }, { searchFields: [] });
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Must be provided at least one search field!');
            isErrorThrown = true;
        }

        expect(isErrorThrown).toBeTruthy();
    });

    describe('#filter()', () => {
        it('should filter by name field', async () => {
            let result = await repository.find();

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('John Doe');
            expect(result[1].name).toBe('Jane Doe');
            expect(result[2].name).toBe('John Smith');

            const filter = new SearchFilter(repository, { search: 'John' }, { searchFields: ['name'] });

            const qb = filter.filter();

            result = await qb.getMany();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('John Doe');
            expect(result[1].name).toBe('John Smith');
        });
    });
});
