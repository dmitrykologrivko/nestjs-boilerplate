import {
    Entity as DatabaseEntity,
    EntityOptions as DatabaseEntityOptions,
} from '../../database/entity.decorator';

export function Entity(options?: DatabaseEntityOptions) {
    return DatabaseEntity(options);
}
