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
import { BaseCrudService } from '../../application/service/base-crud.service';
import { BaseDto } from '../../application/dto/base.dto';
import { BaseEntityDto } from '../../application/dto/base-entity.dto';
import { ListInput } from '../../application/dto/list.input';
import { RetrieveInput } from '../../application/dto/retrieve.input';
import { CreateInput } from '../../application/dto/create.input';
import { UpdateInput } from '../../application/dto/update.input';
import { DestroyInput } from '../../application/dto/destroy.input';
import { BasePaginatedContainer } from '../../application/pagination/base-paginated-container.interface';
import { BaseCrudController } from './base-crud.controller';

export abstract class CrudController<D extends BaseEntityDto,
    // Generic HTTP Request (Express, Fastify, etc.)
    R = any,
    // List
    LI extends ListInput = ListInput,
    LO extends BaseEntityDto = D,
    PC extends BasePaginatedContainer<LO> = BasePaginatedContainer<LO>,
    // Retrieve
    RI extends RetrieveInput = RetrieveInput,
    RO extends BaseEntityDto = D,
    // Create
    CP extends BaseDto = D,
    CI extends CreateInput<CP> = CreateInput<CP>,
    CO extends BaseEntityDto = D,
    // Update
    UP extends BaseEntityDto = D,
    UI extends UpdateInput<UP> = UpdateInput<UP>,
    UO extends BaseEntityDto = D,
    // Destroy
    DI extends DestroyInput = DestroyInput> extends BaseCrudController<D, R, LI, LO, PC, RI, RO, CP, CI, CO, UP, UI, UO, DI> {

    protected constructor(service: BaseCrudService<any, D, LI, LO, PC, RI, RO, CP, CI, CO, UP, UI, UO, DI>) {
        super(service);
    }

    @Get()
    async list(@Req() req: R) {
        return super.list(req);
    }

    @Post()
    async create(@Req() req: R) {
        return super.create(req);
    }

    @Get(':id')
    async retrieve(@Req() req: R) {
        return super.retrieve(req);
    }

    @Put(':id')
    async replace(@Req() req: R) {
        return super.replace(req);
    }

    @Patch(':id')
    async partialUpdate(@Req() req: R) {
        return super.partialUpdate(req);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async destroy(@Req() req: R) {
        return super.destroy(req);
    }
}
