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
import { BaseCrudService } from '../../application/service/base-crud.service';
import { ListQuery } from '../../application/dto/list-query.interface';
import { RetrieveQuery } from '../../application/dto/retrieve-query.interface';
import { DestroyQuery } from '../../application/dto/destroy-query.interface';
import { BaseDto } from '../../application/dto/base.dto';
import { BaseEntityDto } from '../../application/dto/base-entity.dto';
import { ListInput } from '../../application/dto/list.input';
import { RetrieveInput } from '../../application/dto/retrieve.input';
import { DestroyInput } from '../../application/dto/destroy.input';
import { BasePaginatedContainer } from '../../application/pagination/base-paginated-container.interface';
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
