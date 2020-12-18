import { Expose } from 'class-transformer';
import { CrudOperations } from './crud-operations.enum';

export function ReadOnly() {
    return Expose({ groups: [CrudOperations.READ] });
}
