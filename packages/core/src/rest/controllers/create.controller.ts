import { Post, Body } from '@nestjs/common';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { BaseCrudController } from './base-crud.controller';

export abstract class CreateController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Post()
    async create(@Body() input: D): Promise<D> {
        return super.create(input);
    }
}
