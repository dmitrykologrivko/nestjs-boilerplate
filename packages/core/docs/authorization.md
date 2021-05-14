# Authorization

Authorization allows checking if a current user is granted or denied access to performing some operation.
NestJS Boilerplate implements authorization by using permissions.

There are several main types of permissions: global and entity level.\
Global permissions determine the rules for checking if a user is granted to perform operations.\
Entity permissions determine the rules for checking if a user is granted to perform operations related to a concrete 
entity.

## Global permissions

NestJS Boilerplate defines `BasePermission` class. This class allows implementing global permissions.

Let's implement permission that checks if the current user is admin.

```typescript
import { BasePermission, BaseInput } from '@nestjs-boilerplate/core';

export class IsAdminUserPermission extends BasePermission {
    constructor() {
        super('Current user is not admin user');
    }

    async hasPermission(input: BaseInput): Promise<boolean> {
        return input.extra?.user?.isAdmin;
    }
}
```

In your application service use `checkPermissions` function from `@nestjs-boilerplate/core` package and provide a list
of instances global permissions. If one of the provided permissions will return false then result with
`PermissionDeniedException` exception will be returned.

**Note:** Instance of authenticated user must be provided in extra params of the input object.

```typescript
import {
    ApplicationService,
    BasePermission,
    checkPermissions,
    BaseInput,
    PermissionDeniedException,
    Result,
    proceed,
} from '@nestjs-boilerplate/core';
import { NoteDto } from './note.dto';
import { NoteRepositiry } from './note.repository';
import { IsAdminUserPermission } from './is-admin-user.permission';

@ApplicationService()
export class NoteService {
    constructor(
        private readonly noteRepository: NoteRepositiry,
    ) {}
    
    async getNotes(input: BaseInput): Result<NoteDto, PermissionDeniedException> {
        return await checkPermissions<BaseInput>(input, [new IsAdminUserPermission()])
            .then(proceed(this.noteRepository.getNotes()))
            .then(proceed(notes => NoteDto.fromEntities(notes)));
    }
}
```

## Entity permissions

NestJS Boilerplate defines `BaseEntityPermission` class. This class allows implementing entity permissions.

Let's implement permission that checks if the current user is owner of entity.

```typescript
import {
    BaseEntityPermission,
    BaseInput,
    BaseEntity,
} from '@nestjs-boilerplate/core';

export interface Ownable {
    getOwnerId(): number;
}

export class IsOwnerEntityPermission<E extends BaseEntity & Ownable> extends BaseEntityPermission<BaseInput, E> {
    constructor() {
        super('Current user is not owner of the entity');
    }

    async hasEntityPermission(input: BaseInput, entity: E): Promise<boolean> {
        return input.extra?.user?.id === entity.getOwnerId();
    }
}
```

In your application service use `checkEntityPermissions` function from `@nestjs-boilerplate/core` package and 
provide a list of instances entity permissions. If one of the provided permissions will return false then result with
`PermissionDeniedException` exception will be returned.

**Note:** Instance of authenticated user must be provided in extra params of the input object.

```typescript
import {
    ApplicationService,
    BasePermission,
    checkEntityPermissions,
    RetrieveInput,
    PermissionDeniedException,
    Result,
    proceed,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';
import { NoteRepositiry } from './note.repository';
import { IsOwnerEntityPermission } from './is-owner-entity.permission';

@ApplicationService()
export class NoteService {
    constructor(
        private readonly noteRepository: NoteRepositiry,
    ) {}
    
    async getNote(input: RetrieveInput): Result<NoteDto, PermissionDeniedException> {
        return await checkEntityPermissions<RetrieveInput, Note>(input, [new IsOwnerEntityPermission<Note>()])
            .then(proceed(this.noteRepository.getNote(input.id)))
            .then(proceed(note => NoteDto.fromEntity(note)));
    }
}
```