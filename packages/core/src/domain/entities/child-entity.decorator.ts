import {
    DatabaseChildEntity,
    DatabaseChildEntityOptions,
} from '../../database/database-child-entity.decorator';

export function ChildEntity(options?: DatabaseChildEntityOptions) {
    return DatabaseChildEntity(options);
}
