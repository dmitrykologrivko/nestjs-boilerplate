import { IsOptional } from 'class-validator';
import { CrudOperations } from '../constants/crud-operations.enum';

export function PartialUpdate() {
    return IsOptional({ groups: [CrudOperations.PARTIAL_UPDATE] });
}
