import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, PrimaryGeneratedColumn } from 'typeorm';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { MetadataStorageService } from '../../database/metadata-storage.service';
import { EntitySwappableService } from '../../database/entity-swappable.service';
import { MigrationsCommand } from '../../database/migrations.command';
import { TypeormCommandExecutorService } from '../../database/typeorm-command-executor.service';
import { DEFAULT_DATA_SOURCE_NAME } from '../../database/database.constants';
import { Entity } from '../../database/entity.decorator';
import databaseConfig from '../../database/database.config';

describe('DatabaseModule (Integration)', () => {
    let module: TestingModule;

    async function createTestingModule(metadata: ModuleMetadata) {
        module = await Test.createTestingModule(metadata).compile();
        return module;
    }

    @Entity()
    class TestEntity {
        @PrimaryGeneratedColumn()
        id!: number;
    }

    beforeEach(() => {
        EntitySwappableService.clear();
        MetadataStorageService.clear();
    });

    afterEach(async () => {
        if (module) await module.close();

        EntitySwappableService.clear();
        MetadataStorageService.clear();
    });

    it('should register services in the module', async () => {
        module = await createTestingModule({
            imports: [
                DatabaseModule,
            ],
        });

        const metadataStorage = module.get(MetadataStorageService);
        const migrationsCommand = module.get(MigrationsCommand);
        const typeormCommandExecutorService = module.get(TypeormCommandExecutorService);

        expect(metadataStorage).toBeDefined();
        expect(metadataStorage).toBeInstanceOf(MetadataStorageService);
        expect(migrationsCommand).toBeDefined();
        expect(migrationsCommand).toBeInstanceOf(MigrationsCommand);
        expect(typeormCommandExecutorService).toBeDefined();
        expect(typeormCommandExecutorService).toBeInstanceOf(TypeormCommandExecutorService);
    });

    it('should load database config', async () => {
        module = await createTestingModule({
            imports: [
                DatabaseModule,
            ]
        });

        const config = databaseConfig();
        const service = module.get(ConfigService);

        Object.keys(config)
            .forEach((key) => {
                expect(service.get(key)).toEqual(config[key]);
            });
    });

    describe('#withOptions()', () => {
        it('should register multiple TypeORM connections with merged metadata', async () => {
            await createTestingModule({
                imports: [
                    DatabaseModule.withEntities([TestEntity], { dataSource: 'primary' }),
                    DatabaseModule.withOptions([
                        {
                            name: 'primary',
                            type: 'sqlite',
                            database: ':memory:',
                            entities: [],
                            synchronize: true,
                        },
                        {
                            name: 'secondary',
                            type: 'sqlite',
                            database: ':memory:',
                            entities: [],
                            synchronize: true,
                        },
                    ]),
                ],
            });

            const primaryDataSource = module.get<DataSource>(getDataSourceToken('primary'));
            const secondaryDataSource = module.get<DataSource>(getDataSourceToken('secondary'));

            expect(primaryDataSource).toBeInstanceOf(DataSource);
            expect(secondaryDataSource).toBeInstanceOf(DataSource);
            expect(primaryDataSource.options.entities).toContain(TestEntity);
        });
    });

    describe('#withConfig()', () => {
        it('should register default connection using config service', async () => {
            await createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        load: [() => {
                            return {
                                databases: {
                                    default: {
                                        type: 'sqlite',
                                        database: ':memory:',
                                        synchronize: true,
                                        entities: [],
                                    }
                                },
                            };
                        }]
                    }),
                    DatabaseModule.withEntities([TestEntity]),
                    DatabaseModule.withConfig(),
                ],
            });

            const dataSource = module.get<DataSource>(getDataSourceToken('default'));

            expect(dataSource).toBeInstanceOf(DataSource);
            expect(dataSource.options.entities).toContain(TestEntity);
        });

        it('should register connections using config service', async () => {
            await createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        load: [
                            () => ({
                                databases: {
                                    default: {
                                        name: DEFAULT_DATA_SOURCE_NAME,
                                        type: 'sqlite',
                                        database: ':memory:',
                                        synchronize: true,
                                        entities: [],
                                    },
                                    secondary: {
                                        name: 'secondary',
                                        type: 'sqlite',
                                        database: ':memory:',
                                        synchronize: true,
                                        entities: [],
                                    }
                                },
                            }),
                        ]
                    }),
                    DatabaseModule.withEntities([TestEntity], { dataSource: 'secondary' }),
                    DatabaseModule.withConfig([
                        {
                            property: {
                                path: 'databases.default',
                            },
                            name: 'default',
                        },
                        {
                            property: {
                                path: 'databases.secondary',
                            },
                            name: 'secondary',
                        }
                    ]),
                ],
            });

            const dataSource = module.get<DataSource>(getDataSourceToken('default'));
            const secondaryDataSource = module.get<DataSource>(getDataSourceToken('secondary'));

            expect(dataSource).toBeInstanceOf(DataSource);
            expect(dataSource.options.entities.length).toBe(0);
            expect(secondaryDataSource).toBeInstanceOf(DataSource);
            expect(secondaryDataSource.options.entities).toContain(TestEntity);
        });
    });

    describe('#withEntities()', () => {
        it('should register feature entities', async () => {
            await createTestingModule({
                imports: [
                    DatabaseModule.withEntities([TestEntity]),
                    DatabaseModule.withOptions([
                        {
                            name: DEFAULT_DATA_SOURCE_NAME,
                            type: 'sqlite',
                            database: ':memory:',
                            synchronize: true,
                            entities: [],
                        },
                    ]),

                ],
            });

            const dataSource = module.get<DataSource>(getDataSourceToken(DEFAULT_DATA_SOURCE_NAME));
            expect(dataSource.options.entities).toContain(TestEntity);
        });

        it('should register feature entities with swappable logic', async () => {
            // tslint:disable-next-line:max-classes-per-file
            @Entity({ swappable: true })
            class User {
                @PrimaryGeneratedColumn()
                id!: number;
            }
            // tslint:disable-next-line:max-classes-per-file
            @Entity({ swap: User })
            class CustomUser extends User {
                name!: string;
            }

            await createTestingModule({
                imports: [
                    DatabaseModule.withEntities([User, CustomUser]),
                    DatabaseModule.withOptions([
                        {
                            name: DEFAULT_DATA_SOURCE_NAME,
                            type: 'sqlite',
                            database: ':memory:',
                            synchronize: true,
                            entities: [],
                        },
                    ]),
                ],
            });

            const dataSource = module.get<DataSource>(getDataSourceToken(DEFAULT_DATA_SOURCE_NAME));
            expect(dataSource.options.entities).toContain(CustomUser);
        });
    });

    describe('#withMigrations()', () => {
        it('should add migrations to metadata storage', () => {
            // tslint:disable-next-line:max-classes-per-file
            class FakeMigration {}

            DatabaseModule.withMigrations([FakeMigration], {
                dataSource: 'test-ds',
            });

            const metadata = MetadataStorageService.getMetadataByDataSource('test-ds');
            const migrationNames = metadata
                .filter(meta => meta.type === 'migrations')
                .flatMap(meta => meta.constructors.map(m => m.name));

            expect(migrationNames).toContain(FakeMigration.name);
        });
    });
});
