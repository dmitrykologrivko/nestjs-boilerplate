import {
    DatabaseEntity,
    DatabaseEntityOptions,
} from '../../database/database-entity.decorator';

export function ValueObject(options?: DatabaseEntityOptions) {
    return DatabaseEntity(options);
}
