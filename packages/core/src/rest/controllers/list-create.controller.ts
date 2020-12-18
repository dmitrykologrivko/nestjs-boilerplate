import { Get, Post, Body } from '@nestjs/common';
import { BasePaginatedContainer } from '../../domain/pagination/base-paginated-container.interface';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { ListFilter } from '../decorators/list-filter.decorator';
import { ListQuery } from '../../domain/crud/list-query.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class ListCreateController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Get()
    async list(@ListFilter() filter: ListQuery): Promise<BasePaginatedContainer<D>> {
        return super.list(filter);
    }

    @Post()
    async create(@Body() input: D): Promise<D> {
        return super.create(input);
    }
}
