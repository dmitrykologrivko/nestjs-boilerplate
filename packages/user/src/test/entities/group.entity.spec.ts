import { Group, Permission } from '../../entities';
import {
    expectHasPermission,
    expectHasNoPermission,
    expectPermissionsCount,
} from '../expect.utils';

describe('GroupEntity', () => {
    let group: Group;
    let readPermission: Permission;
    let writePermission: Permission;

    beforeEach(() => {
        readPermission = Permission.create(
            'Read Permission',
            'read',
        );
        writePermission = Permission.create(
            'Write Permission',
            'write',
        );

        group = Group.create('Managers Group');
        group.setPermission(readPermission);
        group.setPermission(writePermission);
    });

    describe('#hasPermission()', () => {
        it('when group has permission should return true', () => {
             expect(group.hasPermission(readPermission.codename)).toBe(true);
        });

        it('when groups has no permission should return false', () => {
            expect(group.hasPermission('write_users')).toBe(false);
        });
    });

    describe('#setPermission()', () => {
        it('should set new permission', () => {
            const deletePermission = Permission.create(
                'Delete Permission',
                'delete',
            );

            expectInitialPermissions();

            group.setPermission(deletePermission);

            expectPermissionsCount(3, group);
            expectHasPermission(deletePermission, group);
        });

        it('when permission already set should not duplicate', () => {
            expectInitialPermissions();

            group.setPermission(writePermission);

            expectInitialPermissions();
        });
    });

    describe('#removePermission()', () => {
        it('should pop permission', () => {
            expectInitialPermissions();

            group.removePermission(writePermission.codename);

            expectPermissionsCount(1, group);
            expectHasPermission(readPermission, group);
            expectHasNoPermission(writePermission, group);
        });

        it('when permission is not set should not modify existing permissions', () => {
            expectInitialPermissions();

            group.removePermission('write_users');

            expectInitialPermissions();
        });
    });

    const expectInitialPermissions = () => {
        expectPermissionsCount(2, group);
        expectHasPermission(readPermission, group);
        expectHasPermission(writePermission, group);
    };
});
