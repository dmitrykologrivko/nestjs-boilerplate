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
import { BasePermission, BaseInput, Authorizable } from '@nestjs-boilerplate/core';
import { UserDto } from './user-dto';

export class IsAdminUserPermission extends BasePermission<BaseInput & Authorizable<UserDto>> {
    constructor() {
        super('Current user is not admin user');
    }

    async hasPermission(input: BaseInput & Authorizable<UserDto>): Promise<boolean> {
        return input.user.isAdmin;
    }
}
```

In your application service use `checkPermissions` function from `@nestjs-boilerplate/core` package and provide a list
of instances global permissions. If one of the provided permissions will return false then function throws
`PermissionDeniedException` exception.

**Note:** Instance of authenticated user must be provided in extra params of the input object. Input object must be 
inherited from `BaseInput` class.

```typescript
import { Repository } from 'typeorm';
import {
    ApplicationService,
    InjectRepository,
    BasePermission,
    checkPermissions,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { GetNotesInput } from './get-notes.input';
import { GetNotesOutput } from './get-notes.output';
import { IsAdminUserPermission } from './is-admin-user.permission';

@ApplicationService()
export class NoteService {
    constructor(
        @InjectRepository(Note)
        private readonly noteRepository: Repository<Note>,
    ) {}

    async getNotes(input: GetNotesInput): Promise<GetNotesOutput> {
        await checkPermissions<GetNotesInput>(input, [new IsAdminUserPermission()]);

        const notes = await this.noteRepository.getNotes();
        return GetNotesOutput.fromEntities(notes);
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
    Authorizable,
} from '@nestjs-boilerplate/core';
import { UserDto } from './user-dto';

export interface Ownable {
    getOwnerId(): number;
}

export class IsOwnerEntityPermission<E extends BaseEntity & Ownable>
    extends BaseEntityPermission<BaseInput & Authorizable<UserDto>, E> {

    constructor() {
        super('Current user is not owner of the entity');
    }

    async hasEntityPermission(
        input: BaseInput & Authorizable<UserDto>,
        entity: E,
    ): Promise<boolean> {
        return input.user.id === entity.getOwnerId();
    }
}
```

In your application service use `checkEntityPermissions` function from `@nestjs-boilerplate/core` package and 
provide a list of instances entity permissions. If one of the provided permissions will return false then function 
throws `PermissionDeniedException` exception.

```typescript
import { Repository } from 'typeorm';
import {
    ApplicationService,
    BasePermission,
    checkEntityPermissions,
} from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { GetNoteInput } from './get-note.input';
import { GetNoteOutput } from './get-note.output';
import { IsOwnerEntityPermission } from './is-owner-entity.permission';

@ApplicationService()
export class NoteService {
    constructor(
        private readonly noteRepository: Repository<Note>,
    ) {}
    
    async getNote(input: GetNoteInput): Promise<GetNoteOutput> {
        const note = await this.noteRepository.getNote(input.id);
        
        await checkEntityPermissions<GetNoteInput, Note>(input, note, [new IsOwnerEntityPermission<Note>()]);
        
        return GetNoteOutput.fromEntity(note);
    }
}
```