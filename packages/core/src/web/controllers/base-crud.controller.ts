import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
    UseFilters,
} from '@nestjs/common';
import { ValidationExceptionsFilter } from '../filters/validation-exceptions.filter';
import { PermissionDeniedExceptionFilter } from '../filters/permission-denied-exception.filter';
import { EntityNotFoundExceptionFilter } from '../filters/entity-not-found-exception.filter';
import { BaseCrudService } from '../../application/service/base-crud.service';
import { BasePaginatedContainer } from '../../application/pagination/base-paginated-container.interface';
import { ListInput } from '../../application/dto/list.input';
import { RetrieveInput } from '../../application/dto/retrieve.input';
import { CreateInput } from '../../application/dto/create.input';
import { UpdateInput } from '../../application/dto/update.input';
import { DestroyInput } from '../../application/dto/destroy.input';
import { BaseDto } from '../../application/dto/base.dto';
import { BaseEntityDto } from '../../application/dto/base-entity.dto';
import { Request } from '../request/request';
import {
    extractListQuery,
    extractRetrieveQuery,
    extractDestroyQuery,
} from '../utils/query.utils';

@UseFilters(
    ValidationExceptionsFilter,
    EntityNotFoundExceptionFilter,
    PermissionDeniedExceptionFilter,
)
export abstract class BaseCrudController<D extends BaseEntityDto,
    // Generic HTTP Request (Express, Fastify, etc.)
    R,
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
    DI extends DestroyInput = DestroyInput> {

    protected constructor(
        protected readonly service: BaseCrudService<any, D, LI, LO, PC, RI, RO, CP, CI, CO, UP, UI, UO, DI>,
    ) {}

    @Get()
    async list(@Req() req: R): Promise<PC> {
        const request = this.mapRequest(req);
        const result = await this.service.list(this.mapListInput(request));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Get(':id')
    async retrieve(@Req() req: R): Promise<RO> {
        const request = this.mapRequest(req);
        const result = await this.service.retrieve(this.mapRetrieveInput(request));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Post()
    async create(@Req() req: R): Promise<CO> {
        const request = this.mapRequest(req);
        const result = await this.service.create(this.mapCreateInput(request));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Put(':id')
    async replace(@Req() req: R): Promise<UO> {
        const request = this.mapRequest(req);
        const result = await this.service.update(this.mapUpdateInput(request, false));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Patch(':id')
    async partialUpdate(@Req() req: R): Promise<UO> {
        const request = this.mapRequest(req);
        const result = await this.service.update(this.mapUpdateInput(request, true));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async destroy(@Req() req: R): Promise<void> {
        const request = this.mapRequest(req);
        const result = await this.service.destroy(this.mapDestroyInput(request));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    protected abstract mapRequest(req: R): Request;

    protected mapListInput(req: Request): LI {
        return {
            ...extractListQuery(req),
            extra: {
                user: req.user,
            },
        } as unknown as LI;
    }

    protected mapRetrieveInput(req: Request): RI {
        return {
            ...extractRetrieveQuery(req),
            extra: {
                user: req.user,
            },
        } as unknown as RI;
    }

    protected mapCreateInput(req: Request): CI {
        return {
            payload: {
                ...req.body,
            },
            extra: {
                user: req.user,
            },
        } as unknown as CI;
    }

    protected mapUpdateInput(req: Request, partial: boolean): UI {
        return {
            payload: {
                ...req.body,
                id: req.params.id,
            },
            partial,
            extra: {
                user: req.user,
            },
        } as unknown as UI;
    }

    protected mapDestroyInput(req: Request): DI {
        return {
            ...extractDestroyQuery(req),
            extra: {
                user: req.user,
            }
        } as unknown as DI;
    }
}
