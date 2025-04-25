import { BasePermission } from '../../../application/permissions/base.permission';
import { BaseEntityPermission } from '../../../application/permissions/base-entity.permission';
import { PermissionDeniedException } from '../../../application/permissions/permission-denied.exception';
import { checkPermissions, checkEntityPermissions } from '../../../application/permissions/permissions.utils';
import { BaseInput } from '../../../application/dto/base.input';
import { BaseEntity } from '../../../domain/entities/base.entity';

describe('Permissions Utils', () => {
    class TestInput extends BaseInput {
        role: string;
    }

    // tslint:disable-next-line:max-classes-per-file
    class AdminPermission extends BasePermission<TestInput> {
        constructor() {
            super('Admin permission required');
        }

        hasPermission(input: TestInput): Promise<boolean> {
            return Promise.resolve(input.role === 'admin');
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class TestEntity extends BaseEntity {
        id: number;
        name: string;
        userId: number;
    }

    // tslint:disable-next-line:max-classes-per-file
    class GetEntityInput extends BaseInput {
        userId: number;
    }

    class TestEntityPermission extends BaseEntityPermission<GetEntityInput, TestEntity> {
        constructor() {
            super('Test entity permission required');
        }

        hasEntityPermission(input: GetEntityInput, entity: TestEntity): Promise<boolean> {
            return Promise.resolve(input.userId === entity.userId);
        }
    }

    describe('#checkPermissions()', () => {
        it('should pass if all permissions are granted', async () => {
            const input = new TestInput();
            input.role = 'admin';

            await expect(
                checkPermissions(input, [new AdminPermission()])
            ).resolves.toBeNull();
        });

        it('should throw PermissionDeniedException if a permission is denied', async () => {
            const input = new TestInput();
            input.role = 'user';

            await expect(
                checkPermissions(input, [new AdminPermission()])
            ).rejects.toThrow(PermissionDeniedException);
        });
    });

    describe('checkEntityPermissions', () => {
        it('should return the entity if all permissions are granted', async () => {
            const entity = new TestEntity();
            entity.id = 1;
            entity.name = 'Test Entity';
            entity.userId = 1;

            const input = new GetEntityInput();
            input.userId = 1;

            const result = await checkEntityPermissions(
                input,
                entity,
                [new TestEntityPermission()]
            );

            expect(result).toBe(entity);
        });

        it('should throw PermissionDeniedException if a permission is denied', async () => {
            const entity = new TestEntity();
            entity.id = 1;
            entity.name = 'Test Entity';
            entity.userId = 1;

            const input = new GetEntityInput();
            input.userId = 2;

            await expect(
                checkEntityPermissions(input, entity, [new TestEntityPermission()])
            ).rejects.toThrow(PermissionDeniedException);
        });
    });
});
