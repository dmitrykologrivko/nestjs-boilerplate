import {
    Get,
    Delete,
    Param,
} from '@nestjs/common';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { BaseCrudController } from './base-crud.controller';

export abstract class RetrieveDestroyController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Get(':id')
    async retrieve(@Param('id') id: any): Promise<D> {
        return super.retrieve(id);
    }

    @Delete(':id')
    async destroy(@Param('id') id: any): Promise<void> {
        return super.destroy(id);
    }
}