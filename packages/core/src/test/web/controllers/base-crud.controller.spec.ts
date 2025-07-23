import { mock, MockProxy } from 'jest-mock-extended';
import { BaseEntityDto } from '../../../application/dto/base-entity.dto';
import { BaseEntity } from '../../../domain/entities/base.entity';
import { BaseCrudService } from '../../../application/service/base-crud.service';
import { BasePaginatedContainer } from '../../../application/pagination/base-paginated-container.interface';
import { Request } from '../../../web/request/request';
import { fromExpressRequest } from '../../../web/request/request.utils';
import { BaseCrudController } from '../../../web/controllers/base-crud.controller';

describe('BaseCrudController', () => {
    class TestEntity extends BaseEntity {
        id: number;
        name: string;
    }

    class TestEntityDto extends BaseEntityDto {
        name: string;
    }

    class TestCrudController extends BaseCrudController<TestEntityDto, any> {
        constructor(service: BaseCrudService<TestEntity, TestEntityDto>) {
            super(service);
        }

        protected mapRequest(req: any): Request {
            return fromExpressRequest(req);
        }
    }

    let controller: TestCrudController;
    let crudService: MockProxy<BaseCrudService<TestEntity, TestEntityDto>>;
    const request = {
        query: {},
        body: {},
        params: {},
        headers: {
            host: 'localhost',
        },
        method: 'GET',
        url: '/test',
        cookies: {},
        ip: '127.0.0.1',
        ips: ['127.0.0.1'],
        protocol: 'http',
        user: {
            id: 1,
            name: 'testUser',
        }
    }

    beforeEach(() => {
        crudService = mock<BaseCrudService<TestEntity, TestEntityDto>>();
        controller = new TestCrudController(crudService);
    });

    describe('#list()', () => {
        it('should return a list of entities', async () => {
            const mockEntities: BasePaginatedContainer<TestEntityDto> = {
                results: [
                    {
                        id: 1,
                        name: 'test',
                    },
                    {
                        id: 2,
                        name: 'test2',
                    }
                ]
            };
            crudService.list.mockResolvedValue(mockEntities);

            const result = await controller.list(request);

            expect(crudService.list).toHaveBeenCalledWith({
                query: {},
                params: {},
                sortBy: [],
                search: '',
                where: [],
                path: 'http://localhost/test',
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
            expect(result).toEqual(mockEntities);
        });
    });

    describe('#retrieve()', () => {
        it('should return a single entity by ID', async () => {
            const mockEntity = {
                id: 1,
                name: 'test',
            };
            crudService.retrieve.mockResolvedValue(mockEntity);

            const result = await controller.retrieve({ ...request, params: { id: 1 } });

            expect(crudService.retrieve).toHaveBeenCalledWith({
                id: 1,
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
            expect(result).toEqual(mockEntity);
        });
    });

    describe('#create()', () => {
        it('should create a new entity', async () => {
            const mockEntity = {
                id: 1,
                name: 'test',
            };
            crudService.create.mockResolvedValue(mockEntity);

            const result = await controller.create({ ...request, body: { name: 'Test' } });

            expect(crudService.create).toHaveBeenCalledWith({
                payload: {
                    name: 'Test'
                },
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
            expect(result).toEqual(mockEntity);
        });
    });

    describe('#replace()', () => {
        it('should replace an existing entity', async () => {
            const mockEntity = {
                id: 1,
                name: 'Updated'
            };
            crudService.update.mockResolvedValue(mockEntity);

            const result = await controller.replace({
                ...request,
                params: {
                    id: 1
                },
                body: {
                    name: 'Updated'
                }
            });

            expect(crudService.update).toHaveBeenCalledWith({
                payload: {
                    id: 1,
                    name: 'Updated'
                },
                partial: false,
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
            expect(result).toEqual(mockEntity);
        });
    });

    describe('#partialUpdate()', () => {
        it('should partially update an existing entity', async () => {
            const mockEntity = {
                id: 1,
                name: 'Updated'
            };
            crudService.update.mockResolvedValue(mockEntity);

            const result = await controller.partialUpdate({
                ...request,
                params: {
                    id: 1
                }, body: {
                    name: 'Updated'
                }
            });

            expect(crudService.update).toHaveBeenCalledWith({
                payload: {
                    id: 1,
                    name: 'Updated'
                },
                partial: true,
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
            expect(result).toEqual(mockEntity);
        });
    });

    describe('#destroy()', () => {
        it('should delete an entity by ID', async () => {
            crudService.destroy.mockResolvedValue();

            await controller.destroy({
                ...request,
                params: {
                    id: 1
                }
            });

            expect(crudService.destroy).toHaveBeenCalledWith({
                id: 1,
                user: {
                    id: 1,
                    name: 'testUser'
                }
            });
        });
    });
});