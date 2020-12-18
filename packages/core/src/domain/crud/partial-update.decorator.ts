import { IsOptional } from 'class-validator';
import { CrudOperations } from './crud-operations.enum';

export function PartialUpdate() {
    return IsOptional({ groups: [CrudOperations.PARTIAL_UPDATE] })
}
