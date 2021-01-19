import { Expose, ExposeOptions } from 'class-transformer';
import { CrudOperations } from './crud-operations.enum';

export function ReadOnly(options?: ExposeOptions) {
    const restrictedOperations = [
        CrudOperations.CREATE.toString(),
        CrudOperations.UPDATE.toString(),
        CrudOperations.PARTIAL_UPDATE.toString(),
        CrudOperations.DELETE.toString(),
    ];

    const groups = [
        ...options.groups || [],
        CrudOperations.READ,
    ].filter(group => !restrictedOperations.includes(group))

    return Expose({ ...options, groups });
}
