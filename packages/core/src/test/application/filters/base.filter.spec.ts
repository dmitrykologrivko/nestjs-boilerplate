import {
    DataSource,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { BaseFilter } from '../../../application/filters/base.filter';

describe('BaseFilter (Integration)', () => {
    @Entity()
    class Person {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        name: string;
    }

    // tslint:disable-next-line:max-classes-per-file
    class TestFilter extends BaseFilter<Person> {
        constructor(
            queryBuilderOrRepository: Repository<Person> | SelectQueryBuilder<Person>,
            public readonly searchQuery: string,
        ) {
            super(queryBuilderOrRepository);
        }

        filter(): SelectQueryBuilder<Person> {
            if (!this.searchQuery) {
                return this.queryBuilder;
            }

            const searchField = this.adaptFieldName('name');
            const index = this.getParamIndex('name');

            return this.queryBuilder.andWhere(
                `${searchField} LIKE :${index}`, { [index]: `%${this.searchQuery}%` }
            );
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

        await repository.save(person1);
        await repository.save(person2);
        await repository.save(person3);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should initialize with a SelectQueryBuilder', async () => {
        const qb = repository.createQueryBuilder();

        const filter = new TestFilter(qb, '');

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBe(qb);
    });

    it('should initialize with a Repository and create a query builder', async () => {
        const filter = new TestFilter(repository, '');

        expect(filter.queryBuilder).toBeDefined();
        expect(filter.queryBuilder).toBeInstanceOf(SelectQueryBuilder);
    });

    describe('#filter()', () => {
        it('should filter by name field', async () => {
            let result = await repository.find();

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('John Doe');
            expect(result[1].name).toBe('Jane Doe');
            expect(result[2].name).toBe('John Smith');

            const name = 'John';
            const filter = new TestFilter(repository, 'John');

            const qb = filter.filter();

            result = await qb.getMany();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('John Doe');
            expect(result[1].name).toBe('John Smith');
        });
    });
});
