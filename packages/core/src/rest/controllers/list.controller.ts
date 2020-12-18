import { Get } from '@nestjs/common';
import { BasePaginatedContainer } from '../../domain/pagination/base-paginated-container.interface';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { ListFilter } from '../decorators/list-filter.decorator';
import { ListQuery } from '../../domain/crud/list-query.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class ListController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Get()
    async list(@ListFilter() filter: ListQuery): Promise<BasePaginatedContainer<D>> {
        return super.list(filter);
    }
}
