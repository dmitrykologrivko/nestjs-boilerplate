import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseInput } from '../dto/base.input';
import { BasePermission } from './base.permission';
import { BaseEntityPermission } from './base-entity.permission';
import { PermissionDeniedException } from './permission-denied.exception';

/**
 * Check if the user has the required permissions to perform an action
 * @param input input object
 * @param permissions array of permissions to check
 * @throws PermissionDeniedException
 */
export async function checkPermissions<T extends BaseInput>(
    input: T,
    permissions: BasePermission[],
): Promise<void> {
    for (const permission of permissions) {
        const hasPermission = await permission.hasPermission(input);

        if (!hasPermission) {
            throw new PermissionDeniedException(permission.message);
        }
    }

    return null;
}

/**
 * Check if the user has the required permissions to perform an action on an entity
 * @param input input object
 * @param entity entity object
 * @param permissions array of permissions to check
 * @throws PermissionDeniedException
 */
export async function checkEntityPermissions<T extends BaseInput, E extends BaseEntity>(
    input: T,
    entity: E,
    permissions: BaseEntityPermission[],
): Promise<E> {
    for (const permission of permissions) {
        const hasPermission = await permission.hasEntityPermission(input, entity);

        if (!hasPermission) {
            throw new PermissionDeniedException(permission.message);
        }
    }

    return entity;
}
