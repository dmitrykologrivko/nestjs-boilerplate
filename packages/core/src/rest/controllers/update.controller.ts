import {
    Put,
    Patch,
    Param,
    Body,
} from '@nestjs/common';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { BaseCrudController } from './base-crud.controller';

export abstract class UpdateController<D extends IdentifiableObject> extends BaseCrudController<D> {
    protected constructor(service: BaseCrudService<any, D>) {
        super(service);
    }

    @Put(':id')
    async replace(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.replace(id, input);
    }

    @Patch(':id')
    async partial_update(@Param(':id') id: any, @Body() input: D): Promise<D> {
        return super.partial_update(id, input);
    }
}
