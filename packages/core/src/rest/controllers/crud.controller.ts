import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { BasePaginatedContainer } from '../../domain/pagination/base-paginated-container.interface';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { BaseCrudController } from './base-crud.controller';
import { ListFilter } from '../decorators/list-filter.decorator';
import { ListQuery } from '../../domain/crud/list-query.interface';

export abstract class CrudController<D extends IdentifiableObject> extends BaseCrudController<D> {
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

    @Get(':id')
    async retrieve(@Param('id') id: any): Promise<D> {
        return super.retrieve(id);
    }

    @Put(':id')
    async replace(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.replace(id, input);
    }

    @Patch(':id')
    async partial_update(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.partial_update(id, input);
    }

    @Delete(':id')
    async destroy(@Param('id') id: any): Promise<void> {
        return super.destroy(id);
    }
}
