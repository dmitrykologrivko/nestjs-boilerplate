# Entities

## User

User entity describes a very common structure of user model.

`Username` contains unique username of the user
`Password` contains a password hash of the user's record
`Email` contains unique email of the user
`First Name` contains first name of the user
`Last Name` contains last name of the user
`Is Active` contains the current state of the user's record (active or deactivated)
`Is Admin` contains the tag of admin privilege of the user's record
`Is Superuser` contains the tag of superuser privilege of the user's record
`Groups` contains a list of groups the user belongs to (see below for Group entity)
`Permissions` contains a list of permissions that the user has (see below for Permission entity)

To create a new user instance use the static method `create`. It will validate input, encrypt the password and create
a new instance of the user entity.

```typescript
import { User } from '@nestjs-boilerplate/user';

async function createUser() {
    const user = await User.create(
        'john_smith',
        '12345678',
        'test@test.com',
        'John',
        'Smith',
        true,
        false,
        false,
    );

    console.log(user);
}
```

Check out the list of available methods of User entity:

| Method                   | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| create                   | Creates a new instance of the user                               |
| changeUsername           | Changes current username                                         |
| changeEmail              | Changes current email                                            |
| changeName               | Changes current first and last name                              |
| activateUser             | Activates current user                                           |
| deactivateUser           | Deactivates current user                                         |
| setAdminAccess           | Sets current user as an admin user                               |
| denyAdminAccess          | Sets current user as not admin user                              |
| setSuperuserAccess       | Sets current user as a superuser                                 |
| denySuperuserAccess      | Sets current user as not superuser                               |
| getFullName              | Returns full name (first and last name) of user                  |
| getShortName             | Returns short name (first name) of user                          |
| setPassword              | Sets password hash from plain password                           |
| comparePassword          | Compares plain password with existing user`s password hash       |
| hasPermission            | Checks if user or one of user`s group has permission.            |
| addUserPermission        | Adds permission to user                                          |
| removeUserPermission     | Removes permission from user                                     |
| addToGroup               | Adds user to group                                               |
| removeFromGroup          | Removes user from group                                          |

## Permission

Permission entity describes permission to perform a related action.

`Name` contains human readable name of the permission, e.g. Create Posts
`Codename` contains unique code name of the permission, e.g. create_posts

To create a new permission instance use the static method `create`. It will validate input and create a new instance 
of the permission entity.

```typescript
import { Permission } from '@nestjs-boilerplate/user';

const permission = Permission.create('Create Posts', 'create_posts');

console.log(permission);
```

## Group

Group entity describes a group of permissions.

`Name` contains human-readable name of the group, e.g. Admins
`Permissions` contains a list of permissions

To create a new instance of group use the static method `create`. It will validate input and create a new instance 
of the group entity.

```typescript
import { Group } from '@nestjs-boilerplate/user';

const permission = Permission.create('Create Posts', 'create_posts')
const group = Group.create('Admins', [permission]);

console.log(permission);
console.log(group);
```

Check out the list of available methods of Group entity:

| Method                 | Description                             |
|------------------------|-----------------------------------------|
| create                 | Creates a new instance of the group     |
| hasPermission          | Checks if group has permission          |
| setPermission          | Sets permission to group                |
| removePermission       | Removes permission for group            |
