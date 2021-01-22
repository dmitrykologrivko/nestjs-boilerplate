import {
    DatabaseEntity,
    DatabaseEntityOptions,
} from '../../database/database-entity.decorator';

export function AggregateRoot(options?: DatabaseEntityOptions) {
    return DatabaseEntity(options);
}
