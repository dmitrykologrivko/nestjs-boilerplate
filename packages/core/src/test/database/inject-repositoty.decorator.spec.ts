import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    Repository,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { DatabaseModule } from '../../database/database.module';
import { EntitySwappableService } from '../../database/entity-swappable.service';
import { Entity } from '../../database/entity.decorator';
import { InjectRepository } from '../../database/inject-repositoty.decorator';

describe('InjectRepository Decorator (Integration)', () => {
    beforeAll(() => EntitySwappableService.clear());
    afterAll(() => EntitySwappableService.clear());

    describe('none-swappable entity', () => {
        @Entity()
        class TestEntity {
            @PrimaryGeneratedColumn()
            id!: number;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Injectable()
        class TestService {
            constructor(
                @InjectRepository(TestEntity)
                public readonly testRepository: Repository<TestEntity>,
            ) {}
        }

        let module: TestingModule;
        let service: TestService;

        beforeAll(async () => {
            module = await Test.createTestingModule({
                imports: [
                    DatabaseModule.withOptions([{
                        type: 'sqlite',
                        database: ':memory:',
                        synchronize: true,
                    }]),
                    DatabaseModule.withEntities([TestEntity]),
                ],
                providers: [TestService]
            }).compile();

            service = module.get<TestService>(TestService);
        });

        afterAll(async () => {
            await module.close();
        });

        it('should inject the correct repository', () => {
            expect(service.testRepository).toBeDefined();
            expect(service.testRepository).toBeInstanceOf(Repository);
        });
    });

    describe('swappable entity', () => {
        // tslint:disable-next-line:max-classes-per-file
        @Entity({ swappable: true })
        class User {
            @PrimaryGeneratedColumn()
            id!: number;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Entity({ swap: User })
        class CustomUser {
            @Column()
            username!: string;
        }

        // tslint:disable-next-line:max-classes-per-file
        @Injectable()
        class TestService {
            constructor(
                @InjectRepository(CustomUser)
                public readonly testRepository: Repository<CustomUser>,
            ) {}
        }

        let module: TestingModule;
        let service: TestService;

        beforeAll(async () => {
            module = await Test.createTestingModule({
                imports: [
                    DatabaseModule.withOptions([{
                        type: 'sqlite',
                        database: ':memory:',
                        synchronize: true,
                    }]),
                    DatabaseModule.withEntities([User, CustomUser]),
                ],
                providers: [TestService]
            }).compile();

            service = module.get<TestService>(TestService);
        });

        afterAll(async () => {
            await module.close();
        });

        it('should inject the correct repository', () => {
            expect(service.testRepository).toBeDefined();
            expect(service.testRepository).toBeInstanceOf(Repository);
        });
    });
});
