import { UseFilters } from '@nestjs/common';
import { ValidationExceptionsFilter } from '../filters/validation-exceptions.filter';
import { PermissionDeniedExceptionFilter } from '../filters/permission-denied-exception.filter';
import { EntityNotFoundExceptionFilter } from '../filters/entity-not-found-exception.filter';
import { BaseCrudService, IdentifiableObject } from '../../domain/crud/base-crud.service';
import { ListQuery } from '../../domain/crud/list-query.interface';

@UseFilters(
    ValidationExceptionsFilter,
    EntityNotFoundExceptionFilter,
    PermissionDeniedExceptionFilter,
)
export abstract class BaseCrudController<D extends IdentifiableObject> {

    protected constructor(
        protected readonly service: BaseCrudService<any, D>,
    ) {}

    async list(filter: ListQuery) {
        const result = await this.service.list(filter);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    async retrieve(id: any) {
        const result = await this.service.retrieve({ id });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    async create(input: D) {
        const result = await this.service.create(input);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    async replace(id: any, input: D) {
        const result = await this.service.update({ ...input, id });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    async partial_update(id: any, input: D) {
        const result = await this.service.update({ ...input, id }, true);

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }

    async destroy(id: any) {
        const result = await this.service.destroy({ id });

        if (result.is_err()) {
            throw result.unwrap_err();
        }

        return result.unwrap();
    }
}
