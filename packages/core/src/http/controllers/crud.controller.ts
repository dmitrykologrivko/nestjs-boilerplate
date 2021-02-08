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
import { BaseCrudService } from '../../domain/services/base-crud.service';
import { ListQuery } from '../../domain/dto/list-query.interface';
import { RetrieveQuery } from '../../domain/dto/retrieve-query.interface';
import { DestroyQuery } from '../../domain/dto/destroy-query.interface';
import { BaseDto } from '../../domain/dto/base.dto';
import { BaseEntityDto } from '../../domain/dto/base-entity.dto';
import { ListInput } from '../../domain/dto/list.input';
import { RetrieveInput } from '../../domain/dto/retrieve.input';
import { DestroyInput } from '../../domain/dto/destroy.input';
import { BasePaginatedContainer } from '../../domain/pagination/base-paginated-container.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class CrudController<D extends BaseEntityDto,
    PC extends BasePaginatedContainer<D> = BasePaginatedContainer<D>,
    LI extends ListQuery = ListInput,
    RI extends RetrieveQuery = RetrieveInput,
    CI extends BaseDto = D,
    UI extends BaseEntityDto = D,
    DI extends DestroyQuery = DestroyInput> extends BaseCrudController<D, PC, LI, RI, CI, UI, DI> {

    protected constructor(service: BaseCrudService<any, D, PC, LI, RI, CI, UI, DI>) {
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
