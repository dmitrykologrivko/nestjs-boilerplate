import { Expose } from 'class-transformer';
import { CrudOperations } from './crud-operations.enum';

export function WriteOnly() {
    return Expose({
        groups: [
            CrudOperations.CREATE,
            CrudOperations.UPDATE,
            CrudOperations.PARTIAL_UPDATE,
        ],
    });
}
