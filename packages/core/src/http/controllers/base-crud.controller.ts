import { UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { ValidationExceptionsFilter } from '../filters/validation-exceptions.filter';
import { PermissionDeniedExceptionFilter } from '../filters/permission-denied-exception.filter';
import { EntityNotFoundExceptionFilter } from '../filters/entity-not-found-exception.filter';
import { BasePaginatedContainer } from '../../domain/pagination/base-paginated-container.interface';
import { BaseCrudService } from '../../domain/crud/base-crud.service';
import { ListQuery } from '../../domain/crud/list-query.interface';
import { RetrieveQuery } from '../../domain/crud/retrieve-query.interface';
import { DestroyQuery } from '../../domain/crud/destroy-query.interface';
import { ListInput } from '../../domain/crud/list.input';
import { RetrieveInput } from '../../domain/crud/retrieve.input';
import { DestroyInput } from '../../domain/crud/destroy.input';
import { BaseDto } from '../../domain/dto/base.dto';
import { BaseEntityDto } from '../../domain/dto/base-entity.dto';

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
    PC extends BasePaginatedContainer<D> = BasePaginatedContainer<D>,
    LI extends ListQuery = ListInput,
    RI extends RetrieveQuery = RetrieveInput,
    CI extends BaseDto = D,
    UI extends BaseEntityDto = D,
    DI extends DestroyQuery = DestroyInput> {

    protected constructor(
        protected readonly service: BaseCrudService<any, D, PC, LI, RI, CI, UI, DI>,
    ) {}

    async list(req: Request): Promise<PC> {
        const result = await this.service.list(this.mapListInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async retrieve(req: Request): Promise<D> {
        const result = await this.service.retrieve(this.mapRetrieveInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async create(req: Request): Promise<D> {
        const result = await this.service.create(this.mapCreateInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async replace(req: Request): Promise<D> {
        const result = await this.service.update(this.mapUpdateInput(req));

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }

    async partialUpdate(req: Request): Promise<D> {
        const result = await this.service.update(this.mapUpdateInput(req), true);

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
        return extractListQuery(req) as LI;
    }

    protected mapRetrieveInput(req): RI {
        return extractRetrieveQuery(req) as RI;
    }

    protected mapCreateInput(req): CI {
        return req.body as CI;
    }

    protected mapUpdateInput(req): UI {
        return { ...req.body, id: req.params.id } as UI;
    }

    protected mapDestroyInput(req): DI {
        return extractDestroyQuery(req) as DI;
    }
}
