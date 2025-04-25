import {
    DataSource,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Repository,
    FindOneOptions,
    FindManyOptions,
    Like, SelectQueryBuilder,
} from 'typeorm';
import { BaseWritableRepository } from '../../../application/repositories/base-writable.repository';
import { BaseFindOneQuery } from '../../../application/queries/base-find-one.query';
import { BaseFindManyQuery } from '../../../application/queries/base-find-many.query';
import { BaseBuildableQuery } from '../../../application/queries/base-buildable.query';
import { BaseEntity } from '../../../domain/entities/base.entity';

@Entity()
class PersonWritable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}

// tslint:disable-next-line:max-classes-per-file
class Person extends BaseEntity {
    id: number;
    name: string;
    idName: string;
}

// tslint:disable-next-line:max-classes-per-file
class PersonWritableRepository extends BaseWritableRepository<Person, PersonWritable> {
    protected toEntity(writable: PersonWritable): Person {
        return { ...writable, idName: `${writable.id}-${writable.name}` };
    }

    protected toWritable(entity: Person): PersonWritable {
        return entity;
    }
}

// tslint:disable-next-line:max-classes-per-file
class PersonFindOneQuery implements BaseFindOneQuery<PersonWritable> {
    constructor(
        protected readonly id: number,
    ) {}

    toFindOneOptions(): FindOneOptions<PersonWritable> {
        return { where: { id: this.id } };
    }
}

// tslint:disable-next-line:max-classes-per-file
class PersonFindManyQuery implements BaseFindManyQuery<PersonWritable> {
    constructor(
        protected readonly name: string,
    ) {}

    toFindManyOptions(): FindManyOptions<PersonWritable> {
        return { where: { name: Like(`%${this.name}%`) } };
    }
}

// tslint:disable-next-line:max-classes-per-file
class PersonBuildableQuery implements BaseBuildableQuery<PersonWritable> {
    constructor(
        protected readonly name: string,
    ) {}

    toQueryBuilder(
        alias: string,
        queryBuilder: SelectQueryBuilder<PersonWritable>,
    ): SelectQueryBuilder<PersonWritable> {
        return queryBuilder.andWhere(`${alias}.name = :name`, { name: this.name });
    }
}

describe('BaseWritableRepository (Integration)', () => {
    let dataSource: DataSource;
    let repository: Repository<PersonWritable>;
    let writableRepository: PersonWritableRepository;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [PersonWritable],
        });
        await dataSource.initialize();

        repository = dataSource.getRepository(PersonWritable);
        writableRepository = new PersonWritableRepository(repository, PersonWritable);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    describe('#find()', () => {
        it('should find all entities', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find();

            expect(entities).toHaveLength(2);
            expect(entities[0].name).toBe('John Doe');
            expect(entities[0].idName).toBe('1-John Doe');
            expect(entities[1].name).toBe('John Smith');
            expect(entities[1].idName).toBe('2-John Smith');
        });

        it('should find all entities using unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find(null, unitOfWork);

            expect(entities).toHaveLength(2);
            expect(entities[0].name).toBe('John Doe');
            expect(entities[0].idName).toBe('1-John Doe');
            expect(entities[1].name).toBe('John Smith');
            expect(entities[1].idName).toBe('2-John Smith');

            await unitOfWork.release();
        });

        it('should find all entities using BaseFindManyQuery', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find(
                new PersonFindManyQuery('John')
            );

            expect(entities).toHaveLength(2);
            expect(entities[0].name).toBe('John Doe');
            expect(entities[0].idName).toBe('1-John Doe');
            expect(entities[1].name).toBe('John Smith');
            expect(entities[1].idName).toBe('2-John Smith');
        });

        it('should find all entities using BaseFindManyQuery and unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find(
                new PersonFindManyQuery('John'),
                unitOfWork,
            );

            expect(entities).toHaveLength(2);
            expect(entities[0].name).toBe('John Doe');
            expect(entities[0].idName).toBe('1-John Doe');
            expect(entities[1].name).toBe('John Smith');
            expect(entities[1].idName).toBe('2-John Smith');

            await unitOfWork.release();
        });

        it('should find entity using BaseBuildableQuery', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find(
                new PersonBuildableQuery('John Smith')
            );

            expect(entities).toHaveLength(1);
            expect(entities[0].name).toBe('John Smith');
            expect(entities[0].idName).toBe('2-John Smith');
        });

        it('should find entity using BaseBuildableQuery and unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);

            const entities = await writableRepository.find(
                new PersonBuildableQuery('John Smith'),
                unitOfWork,
            );

            expect(entities).toHaveLength(1);
            expect(entities[0].name).toBe('John Smith');
            expect(entities[0].idName).toBe('2-John Smith');

            await unitOfWork.release();
        });
    });

    describe('#findOne()', () => {
        it('should find all entity using PersonFindOneQuery', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);

            const entity = await writableRepository.findOne(
                new PersonFindOneQuery(1)
            );

            expect(entity).toBeDefined();
            expect(entity.name).toBe('John Doe');
            expect(entity.idName).toBe('1-John Doe');
        });

        it('should find all entities using PersonFindOneQuery and unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);

            const entity = await writableRepository.findOne(
                new PersonFindOneQuery(1),
                unitOfWork,
            );

            expect(entity).toBeDefined();
            expect(entity.name).toBe('John Doe');
            expect(entity.idName).toBe('1-John Doe');

            await unitOfWork.release();
        });

        it('should find entity using BaseBuildableQuery', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);

            const entity = await writableRepository.findOne(
                new PersonBuildableQuery('John Smith')
            );

            expect(entity).toBeDefined();
            expect(entity.name).toBe('John Smith');
            expect(entity.idName).toBe('2-John Smith');
        });

        it('should find entity using BaseBuildableQuery and unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);

            const entity = await writableRepository.findOne(
                new PersonBuildableQuery('John Smith'),
                unitOfWork,
            );

            expect(entity).toBeDefined();
            expect(entity.name).toBe('John Smith');
            expect(entity.idName).toBe('2-John Smith');

            await unitOfWork.release();
        });
    });

    describe('#save()', () => {
        it('should save an entity', async () => {
            const entity = new Person();
            entity.name = 'Test Name';

            const savedEntity = await writableRepository.save(entity) as Person;

            expect(savedEntity).toBeDefined();
            expect(savedEntity.id).toBeDefined();
            expect(savedEntity.name).toBe('Test Name');
        });

        it('should save an entity using unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            const entity = new Person();
            entity.name = 'Test Name';

            const savedEntity = await writableRepository.save(entity, unitOfWork) as Person;

            expect(savedEntity).toBeDefined();
            expect(savedEntity.id).toBeDefined();
            expect(savedEntity.name).toBe('Test Name');

            await unitOfWork.release();
        });

        it('should update an entity', async () => {
            let entityWritable = new PersonWritable();
            entityWritable.name = 'Test Name';

            entityWritable = await repository.save(entityWritable);

            const entity = new Person();
            entity.id = entityWritable.id;
            entity.name = 'Updated Test Name';

            const savedEntity = await writableRepository.save(entity) as Person;

            expect(savedEntity).toBeDefined();
            expect(savedEntity.id).toBeDefined();
            expect(savedEntity.name).toBe('Updated Test Name');
        });

        it('should save an entity using unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            let entityWritable = new PersonWritable();
            entityWritable.name = 'Test Name';

            entityWritable = await unitOfWork.manager.save(entityWritable);

            const entity = new Person();
            entity.id = entityWritable.id;
            entity.name = 'Updated Test Name';

            const savedEntity = await writableRepository.save(entity, unitOfWork) as Person;

            expect(savedEntity).toBeDefined();
            expect(savedEntity.id).toBeDefined();
            expect(savedEntity.name).toBe('Updated Test Name');

            await unitOfWork.release();
        });
    });

    describe('#remove()', () => {
        it('should remove an entity', async () => {
            await repository.save([
                repository.create({ name: 'John Doe' }),
                repository.create({ name: 'John Smith' }),
            ]);
            const entityWritable = await repository.findOne({ where: { name: 'John Smith' } });
            const entity = new Person();
            entity.id = entityWritable.id;
            entity.name = entityWritable.name;

            await writableRepository.remove(entity);

            expect(await repository.findOne({ where: { name: 'John Smith' } })).toBeNull();
        });

        it('should remove an entity using unit of work', async () => {
            const unitOfWork = dataSource.createQueryRunner();
            await unitOfWork.connect();

            await unitOfWork.manager.save([
                unitOfWork.manager.create(PersonWritable, { name: 'John Doe' }),
                unitOfWork.manager.create(PersonWritable, { name: 'John Smith' }),
            ]);
            const entityWritable = await unitOfWork.manager.findOne(
                PersonWritable,
                { where: { name: 'John Smith' } },
            );
            const entity = new Person();
            entity.id = entityWritable.id;
            entity.name = entityWritable.name;

            await writableRepository.remove(entity);

            expect(
                await unitOfWork.manager.findOne(
                    PersonWritable,
                    { where: { name: 'John Smith' } },
                )
            ).toBeNull();

            await unitOfWork.release();
        });
    });
});
