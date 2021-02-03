import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { BaseCrudService } from '../../domain/crud/base-crud.service';
import { ListQuery } from '../../domain/crud/list-query.interface';
import { RetrieveQuery } from '../../domain/crud/retrieve-query.interface';
import { DestroyQuery } from '../../domain/crud/destroy-query.interface';
import { BaseDto } from '../../domain/dto/base.dto';
import { BaseEntityDto } from '../../domain/dto/base-entity.dto';
import { ListInput } from '../../domain/crud/list.input';
import { RetrieveInput } from '../../domain/crud/retrieve.input';
import { DestroyInput } from '../../domain/crud/destroy.input';
import { BaseCrudController } from './base-crud.controller';

export abstract class CrudController<D extends BaseEntityDto,
    LI extends ListQuery = ListInput,
    RI extends RetrieveQuery = RetrieveInput,
    CI extends BaseDto = D,
    UI extends BaseEntityDto = D,
    DI extends DestroyQuery = DestroyInput> extends BaseCrudController<D, LI, RI, CI, UI, DI> {

    protected constructor(service: BaseCrudService<any, D, LI, RI, CI, UI, DI>) {
        super(service);
    }

    @Get()
    async list(@Req() req: Request) {
        return super.list(req);
    }

    @Post()
    async create(@Req() req: Request) {
        return super.create(req);
    }

    @Get(':id')
    async retrieve(@Req() req: Request) {
        return super.retrieve(req);
    }

    @Put(':id')
    async replace(@Req() req: Request) {
        return super.replace(req);
    }

    @Patch(':id')
    async partialUpdate(@Req() req: Request) {
        return super.partialUpdate(req);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async destroy(@Req() req: Request) {
        return super.destroy(req);
    }
}
