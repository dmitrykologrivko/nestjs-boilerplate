import {
    DataSource,
    Entity,
    PrimaryGeneratedColumn,
    TableInheritance,
} from 'typeorm';
import { ChildEntity } from '../../database/child-entity.decorator';

describe('ChildEntity Decorator (Integration)', () => {
    @Entity()
    @TableInheritance({ column: { type: 'varchar', name: 'type' } })
    class BaseEntity {
        @PrimaryGeneratedColumn()
        id!: number;
    }

    // tslint:disable-next-line:max-classes-per-file
    @ChildEntity({ discriminatorValue: 'child' })
    class ChildEntityExample extends BaseEntity {}

    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [BaseEntity, ChildEntityExample],
        });
        await dataSource.initialize();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('should persist and retrieve a child entity', async () => {
        const repository = dataSource.getRepository(ChildEntityExample);

        const childEntity = new ChildEntityExample();
        await repository.save(childEntity);

        const savedEntity = await repository.findOneBy({ id: childEntity.id });
        expect(savedEntity).toBeDefined();
        expect(savedEntity).toBeInstanceOf(ChildEntityExample);
    });
});
