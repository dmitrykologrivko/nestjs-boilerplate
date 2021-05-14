import { UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { ValidationExceptionsFilter } from '../filters/validation-exceptions.filter';
import { PermissionDeniedExceptionFilter } from '../filters/permission-denied-exception.filter';
import { EntityNotFoundExceptionFilter } from '../filters/entity-not-found-exception.filter';
import { BasePaginatedContainer } from '../../application/pagination/base-paginated-container.interface';
import { BaseCrudService } from '../../application/service/base-crud.service';
import { ListInput } from '../../application/dto/list.input';
import { RetrieveInput } from '../../application/dto/retrieve.input';
import { CreateInput } from '../../application/dto/create.input';
import { UpdateInput } from '../../application/dto/update.input';
import { DestroyInput } from '../../application/dto/destroy.input';
import { BaseDto } from '../../application/dto/base.dto';
import { BaseEntityDto } from '../../application/dto/base-entity.dto';
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

    async list(req: Request): Promise<PC> {
        const result = await this.service.list(this.mapListInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async retrieve(req: Request): Promise<RO> {
        const result = await this.service.retrieve(this.mapRetrieveInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async create(req: Request): Promise<CO> {
        const result = await this.service.create(this.mapCreateInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async replace(req: Request): Promise<UO> {
        const result = await this.service.update(this.mapUpdateInput(req, false));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async partialUpdate(req: Request): Promise<UO> {
        const result = await this.service.update(this.mapUpdateInput(req, true));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async destroy(req: Request): Promise<void> {
        const result = await this.service.destroy(this.mapDestroyInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    protected mapListInput(req): LI {
        return {
            ...extractListQuery(req),
            extra: {
                user: req.user,
            },
        } as unknown as LI;
    }

    protected mapRetrieveInput(req): RI {
        return {
            ...extractRetrieveQuery(req),
            extra: {
                user: req.user,
            },
        } as unknown as RI;
    }

    protected mapCreateInput(req): CI {
        return {
            payload: {
                ...req.body,
            },
            extra: {
                user: req.user,
            },
        } as unknown as CI;
    }

    protected mapUpdateInput(req, partial: boolean): UI {
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

    protected mapDestroyInput(req): DI {
        return extractDestroyQuery(req) as DI;
    }
}
