import {
    DatabaseEntity,
    DatabaseEntityOptions,
} from '../../database/database-entity.decorator';

export function Entity(options?: DatabaseEntityOptions) {
    return DatabaseEntity(options);
}
