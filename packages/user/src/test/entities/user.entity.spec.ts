import * as bcrypt from 'bcrypt';
import { User, Group, Permission } from '../../entities';
import {
    expectHasPermission,
    expectHasNoPermission,
    expectPermissionsCount,
    expectGroupsCount,
    expectHasGroup,
} from '../expect.utils';

describe('UserEntity', () => {
    const SALT_ROUNDS = 10;
    const USERNAME = 'happy_user';
    const PASSWORD = 'sfs3opjk*fgsg';
    const EMAIL = 'happy.user@email.com';
    const FIRST_NAME = 'John';
    const LAST_NAME = 'Smith';

    let user: User;
    let group: Group;
    let readPermission: Permission;
    let writePermission: Permission;
    let deletePermission: Permission;

    beforeEach (async () => {
        readPermission = Permission.create(
            'Read Permission',
            'read',
        ).unwrap();

        writePermission = Permission.create(
            'Write Permission',
            'write',
        ).unwrap();

        deletePermission = Permission.create(
            'Delete Permission',
            'delete',
        ).unwrap();

        group = Group.create('Managers Group').unwrap();
        group.id = 1;
        group.setPermission(readPermission);

        const createUserResult = await User.create(
            USERNAME,
            PASSWORD,
            EMAIL,
            FIRST_NAME,
            LAST_NAME,
        );
        user = createUserResult.unwrap();
        user.addToGroup(group);
        user.addUserPermission(writePermission);
    });

    describe('#changeUsername()', () => {
        it('should change current username', () => {
            const newUsername = 'bad_user';

            expect(user.username).toBe(USERNAME);

            user.changeUsername(newUsername);

            expect(user.username).toBe(newUsername);
        });
    });

    describe('#changeEmail()', () => {
        it('should change current email', () => {
            const newEmail = 'new@email.com';

            expect(user.email).toBe(EMAIL);

            user.changeEmail(newEmail);

            expect(user.email).toBe(newEmail);
        });
    });

    describe('#changeName()', () => {
        it('should change current first and last name', () => {
            const newFirstName = 'Hanna';
            const newLastName = 'Parker';

            expect(user.firstName).toBe(FIRST_NAME);
            expect(user.lastName).toBe(LAST_NAME);

            user.changeName(newFirstName, newLastName);

            expect(user.firstName).toBe(newFirstName);
            expect(user.lastName).toBe(newLastName);
        });
    });

    describe('#activateUser()', () => {
        it('should activate user', () => {
            user.deactivateUser();

            expect(user.isActive).toBe(false);

            user.activateUser();

            expect(user.isActive).toBe(true);
        });
    });

    describe('#deactivateUser()', () => {
        it('should deactivate user', () => {
            user.activateUser();

            expect(user.isActive).toBe(true);

            user.deactivateUser();

            expect(user.isActive).toBe(false);
        });
    });

    describe('#setAdminAccess()', () => {
        it('should set admin access to user', () => {
            user.denyAdminAccess();

            expect(user.isAdmin).toBe(false);

            user.setAdminAccess();

            expect(user.isAdmin).toBe(true);
        });
    });

    describe('#denyAdminAccess()', () => {
        it('should deny admin access to user', () => {
            user.setAdminAccess();

            expect(user.isAdmin).toBe(true);

            user.denyAdminAccess();

            expect(user.isAdmin).toBe(false);
        });
    });

    describe('#setSuperuserAccess()', () => {
        it('should set superuser access to user', () => {
            user.denySuperuserAccess();

            expect(user.isSuperuser).toBe(false);

            user.setSuperuserAccess();

            expect(user.isSuperuser).toBe(true);
        });
    });

    describe('#denySuperuserAccess()', () => {
        it('should deny superuser access to user', () => {
            user.setSuperuserAccess();

            expect(user.isSuperuser).toBe(true);

            user.denySuperuserAccess();

            expect(user.isSuperuser).toBe(false);
        });
    });

    describe('#getFullName()', () => {
        it('should return full name', () => {
            expect(user.getFullName()).toBe(`${user.firstName} ${user.lastName}`);
        });
    });

    describe('#getShortName()', () => {
        it('should return short name', () => {
            expect(user.getShortName()).toBe(user.firstName);
        });
    });

    describe('#setPassword()', () => {
        it('should set hashed password', async () => {
            await user.setPassword(PASSWORD, SALT_ROUNDS);
            const isMatch = await bcrypt.compare(PASSWORD, user.password);

            expect(isMatch).toBe(true);
        });
    });

    describe('#comparePassword()', () => {
        it('when password matches should return true', async () => {
            const result = await user.comparePassword(PASSWORD);
            expect(result).toBe(true);
        });

        it('when password does not match should return false', async () => {
            const result = await user.comparePassword('some-password');
            expect(result).toBe(false);
        });
    });

    describe('#hasPermission()', () => {
        it('when active superuser has no permission should return true', () => {
            user.activateUser();
            user.setSuperuserAccess();

            // Make sure that user and group have no permission
            expectHasNoPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);

            expect(user.hasPermission(deletePermission.codename)).toBe(true);
        });

        it('when user has no permission should return false', () => {
            // Make sure that user and group have no permission
            expectHasNoPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);

            expect(user.hasPermission(deletePermission.codename)).toBe(false);
        });

        it('when user has permission should return true', () => {
            // Make sure that user has permission
            expectHasPermission(writePermission, user);
            // Make sure that group has no permission
            expectHasNoPermission(writePermission, group);

            expect(user.hasPermission(writePermission.codename)).toBe(true);
        });

        it('when user has no permission and group has it should return true', () => {
            // Make sure that group has permission
            expectHasPermission(readPermission, group);
            // Make sure that user has no permission
            expectHasNoPermission(readPermission, user);

            expect(user.hasPermission(readPermission.codename)).toBe(true);
        });
    });

    describe('#addUserPermission()', () => {
        it('should add new user permission', () => {
            expectInitialPermissions();

            user.addUserPermission(deletePermission);

            expectPermissionsCount(2, user);
            expectPermissionsCount(1, group);
            expectHasPermission(deletePermission, user);
            expectHasNoPermission(deletePermission, group);
        });

        it('when permission already added should not duplicate', () => {
            expectInitialPermissions();

            user.addUserPermission(writePermission);

            expectInitialPermissions();
        });
    });

    describe('#removeUserPermission()', () => {
        it('should remove user permission', () => {
            expectInitialPermissions();

            user.removeUserPermission(writePermission.codename);

            expectPermissionsCount(0, user);
            expectPermissionsCount(1, group);
            expectHasNoPermission(writePermission, user);
            expectHasPermission(readPermission, group);
        });

        it('when permission is not added should not modify existing permissions', () => {
            expectInitialPermissions();

            user.removeUserPermission('delete');

            expectInitialPermissions();
        });
    });

    describe('#addToGroup()', () => {
        it('should add user to new group', () => {
            expectInitialGroups();

            const newGroup = Group.create('Sales Group').unwrap();
            newGroup.id = 2;

            user.addToGroup(newGroup);

            expectGroupsCount(2, user);
            expectHasGroup(newGroup, user);
        });

        it('when user already in group should not duplicate', () => {
            expectInitialGroups();

            user.addToGroup(group);

            expectInitialGroups();
        });
    });

    describe('#removeFromGroup()', () => {
        it('should remove user from group', () => {
            expectInitialGroups();

            user.removeFromGroup(group);

            expectGroupsCount(0, user);
        });

        it('when user is not in group should not modify existing groups', () => {
            expectInitialGroups();

            const newGroup = Group.create('Sales Group').unwrap();
            newGroup.id = 2;

            user.removeFromGroup(newGroup);

            expectInitialGroups();
        });
    });

    const expectInitialPermissions = () => {
        expectPermissionsCount(1, user);
        expectPermissionsCount(1, group);
        expectHasPermission(writePermission, user);
        expectHasPermission(readPermission, group);
    };

    const expectInitialGroups = () => {
        expectGroupsCount(1, user);
        expectHasGroup(group, user);
    };
});
