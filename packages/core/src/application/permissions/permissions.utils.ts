import { Result, ok, err } from '../../utils/monads';
import { BaseEntity } from '../../domain/entities/base.entity';
import { BaseInput } from '../dto/base.input';
import { BasePermission } from './base.permission';
import { BaseEntityPermission } from './base-entity.permission';
import { PermissionDeniedException } from './permission-denied.exception';

export async function checkPermissions<T extends BaseInput>(
    input: T,
    permissions: BasePermission[],
): Promise<Result<void, PermissionDeniedException>> {
    for (const permission of permissions) {
        const hasPermission = await permission.hasPermission(input);

        if (!hasPermission) {
            return err(
                new PermissionDeniedException(permission.message),
            );
        }
    }

    return ok(null);
}

export async function checkEntityPermissions<T extends BaseInput, E extends BaseEntity>(
    input: T,
    entity: E,
    permissions: BaseEntityPermission[],
): Promise<Result<E, PermissionDeniedException>> {
    for (const permission of permissions) {
        const hasPermission = await permission.hasEntityPermission(input, entity);

        if (!hasPermission) {
            return err(
                new PermissionDeniedException(permission.message),
            );
        }
    }

    return ok(entity);
}
