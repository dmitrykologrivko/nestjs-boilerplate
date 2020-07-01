import {
    Entity as DatabaseEntity,
    EntityOptions as DatabaseEntityOptions,
} from '../../database/entity.decorator';

export function ValueObject(options?: DatabaseEntityOptions) {
    return DatabaseEntity(options);
}
