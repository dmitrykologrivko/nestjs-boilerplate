import { User, Group, Permission } from '../entities';

export function expectHasNoPermission(permission: Permission, entity: User | Group) {
    expect(entity.permissions.find(currentPermission => currentPermission.codename === permission.codename))
        .toBe(undefined);
}

export function expectHasPermission(permission: Permission, entity: User | Group) {
    expect(entity.permissions.find(currentPermission => currentPermission.codename === permission.codename))
        .toBe(permission);
}

export function expectPermissionsCount(expectedCount: number, entity: User | Group) {
    expect(entity.permissions.length).toBe(expectedCount);
}

export function expectGroupsCount(expectedCount: number, user: User) {
    expect(user.groups.length).toBe(expectedCount);
}

export function expectHasGroup(group: Group, user: User) {
    expect(user.groups.find(currentGroup => currentGroup.id === group.id))
        .toBe(group);
}
