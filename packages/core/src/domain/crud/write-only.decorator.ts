import { Expose, ExposeOptions } from 'class-transformer';
import { CrudOperations } from './crud-operations.enum';
import { CRUD_CREATE_UPDATE_OPERATIONS } from './crud.constants';

export function WriteOnly(options?: ExposeOptions) {
    const restrictedOperations = [
        CrudOperations.READ.toString(),
        CrudOperations.DELETE.toString(),
    ];

    const groups = [
        ...options.groups || [],
        ...CRUD_CREATE_UPDATE_OPERATIONS,
    ].filter(group => !restrictedOperations.includes(group))

    return Expose({ ...options, groups });
}
