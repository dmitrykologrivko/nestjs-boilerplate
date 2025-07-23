import { DataSource, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Entity } from '../../database/entity.decorator';
import { EntitySwappableService, getTargetName } from '../../database/entity-swappable.service';

describe('Entity Decorator (Integration)', () => {
    beforeEach(async () => {
        EntitySwappableService.clear();
    });

    afterEach(async () => {
        EntitySwappableService.clear();
    });

    async function connectToDatabase(entities: Function[]) {
        const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities,
        });
        await dataSource.initialize();
        return dataSource;
    }

    it('should persist and retrieve a basic entity', async () => {
        @Entity({ name: 'basic_entity' })
        class BasicEntity {
            @PrimaryGeneratedColumn()
            id!: number;

            @Column()
            name!: string;
        }

        const dataSource = await connectToDatabase([BasicEntity]);

        const repository = dataSource.getRepository(BasicEntity);
        const entity = repository.create({ name: 'Test Entity' });
        await repository.save(entity);

        const savedEntity = await repository.findOneBy({ id: entity.id });
        expect(savedEntity).toBeDefined();
        expect(savedEntity?.name).toBe('Test Entity');

        await dataSource.destroy();
    });

    it('should register and swap a swappable entity', async () => {
        // tslint:disable-next-line:max-classes-per-file
        @Entity({ swappable: true })
        class User {
            @PrimaryGeneratedColumn()
            id!: number;

            @Column()
            username!: string;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity()
        class Token {
            @PrimaryGeneratedColumn()
            id!: number;

            @Column()
            token!: string;

            @ManyToOne(getTargetName(User), { eager: true })
            user: User;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity({ swap: User })
        class CustomUser extends User {
            @Column()
            name!: string;
        }

        const dataSource = await connectToDatabase([User, Token, CustomUser]);

        const userRepository = dataSource.getRepository(CustomUser);
        const user = userRepository.create({ username: 'test-user', name: 'Test Name' });
        await userRepository.save(user);

        const tokenRepository = dataSource.getRepository(Token);
        const token = tokenRepository.create({ token: 'abcde12345', user });
        await tokenRepository.save(token);

        const savedUser = await userRepository.findOneBy({ id: user.id });
        expect(savedUser).toBeDefined();
        expect(savedUser.id).toBe(user.id);
        expect(savedUser.username).toBe(user.username);
        expect(savedUser.name).toBe(user.name);

        const savedToken = await tokenRepository.findOneBy({ id: token.id });
        expect(savedToken).toBeDefined();
        expect(savedToken.token).toBe(token.token);
        expect(savedToken.user.id).toBe(user.id);

        await dataSource.destroy();
    });

    it('should throw error if swappable and swap provided', async () => {
        // tslint:disable-next-line:max-classes-per-file
        class InvalidEntity {}

        expect(() => {
            Entity({ swappable: true, swap: InvalidEntity })(InvalidEntity);
        }).toThrow('InvalidEntity cannot be swappable and have swap entity at the same time');
    });
});
