# Controllers

You can create regular controllers as you always do. To all this NestJS Boilerplate contains some extra tools 
for buildind controllers easy and quicly.

## Decorators

### ApiController

`ApiController` decorator adds `api` prefix automatically to controller route path prefix and marks class as controller.

In the following example for a controller will be registered path `api/notes`.

```typescript
import { ApiController } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {}
```

Additional decorator options:
`useGlobalPrefix` allows using a globally defined prefix instead of automatically add `api` prefix.
`rootPrefix` allows overriding `api` prefix to custom provided.
`version` allows providing version of api.
`versionPrefix` allows providing custom version prefix, default `v` value.
`additionalPrefixes` allows providing additional prefixes that will be added before the controller route path prefix.
`path` allows providing the controller route path prefix.

### ListFilter

`ListFilter` decorator parses `ListQuery` object from request. `ListQuery` object implements the following interfaces: 
`OrderingQuery`, `SearchQuery`, `WhereQuery`, `PagePaginationQuery`, `LimitOffsetPaginationQuery`.
See [filters](./filters.md) and [pagination](./pagination.md) sections.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, ListFilter, ListQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    getAllNotes(@ListFilter() query: ListQuery) {
        return query;
    }
}
```

### RetrieveFilter

`RetrieveFilter` decorator parses `RetrieveQuery` object from request.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, RetrieveFilter, RetrieveQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get(':id')
    getNote(@RetrieveFilter() query: RetrieveQuery) {
        return query;
    }
}
```

### DestroyFilter

`DestroyFilter` decorator parses `RetrieveQuery` object from request.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, DestroyFilter, DestroyQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get(':id')
    deleteNote(@DestroyFilter() query: DestroyQuery) {
        return query;
    }
}
```

### Search

`Search` decorator parses `SearchQuery` object from request.
See [filters](./filters.md) section.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, Search, SearchQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    searchNotes(@Search() query: SearchQuery) {
        return query;
    }
}
```

### SortBy

`SortBy` decorator parses `OrderingQuery` object from request.
See [filters](./filters.md) section.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, SortBy, OrderingQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    searchNotes(@SortBy() query: OrderingQuery) {
        return query;
    }
}
```

### Where

`Where` decorator parses `WhereQuery` object from request.
See [filters](./filters.md) section.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, SortBy, WhereQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    getNotes(@Where() query: WhereQuery) {
        return query;
    }
}
```

### LimitOffset

`LimitOffset` decorator parses `LimitOffsetPaginationQuery` object from request.
See [pagination](./pagination.md) section.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, LimitOffset, LimitOffsetPaginationQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    getNotes(@LimitOffset() query: LimitOffsetPaginationQuery) {
        return query;
    }
}
```

### Page

`Page` decorator parses `LimitOffsetPaginationQuery` object from request.
See [pagination](./pagination.md) section.

```typescript
import { Get } from '@nestjs/common';
import { ApiController, Page, PagePaginationQuery } from '@nestjs-boilerplate/core';

@ApiController('notes')
export class NoteController {

    @Get()
    getNotes(@Page() query: PagePaginationQuery) {
        return query;
    }
}
```

## CRUD controller

NestJS Boilerplate defines abstract `CrudController` class which allows extended classes have the implementation of 
CRUD operations using the standard REST (GET, POST, PUT, PATCH, DELETE) methods. Requires CRUD application service.

```typescript
import { CrudController, ApiController } from '@nestjs-boilerplate/core';
import { NoteService } from './note.service';
import { NoteDto } from './note.dto';

@ApiController('notes')
export class NoteController extends CrudController<NoteDto> {
    constructor(
        private noteService: NoteService,
    ) {
        super(noteService);
    }
}
```

### Customize CRUD controller
#### Base CRUD controller

NestJS Boilerplate defines abstract `BaseCrudController` class which is essentially a blueprint for implementing 
necessary CRUD operations. `CrudController` class extends `BaseCrudController` class and expose all CRUD operation.
If you need to have only some operations then you need to extend your controller class from `BaseCrudController` class.

```typescript
import { Get, Post, Req } from '@nestjs/common';
import { BaseCrudController, ApiController } from '@nestjs-boilerplate/core';
import { NoteService } from './note.service';
import { NoteDto } from './note.dto';

@ApiController('notes')
export class NoteController extends BaseCrudController<NoteDto> {
    constructor(
        private noteService: NoteService,
    ) {
        super(noteService);
    }

    @Get()
    async list(@Req() req: any) {
        return super.list(req);
    }

    @Post()
    async create(@Req() req: any) {
        return super.create(req);
    }

    @Get(':id')
    async retrieve(@Req() req: any) {
        return super.retrieve(req);
    }
}
```

#### Generic arguments

`BaseCrudController` may receive the following generic arguments:
* Entity DTO
* Request (Generic HTTP Request such as: Express, Fastify, etc.)
* ListInput
* ListOutput
* PaginatedContainer
* RetrieveInput
* RetrieveOutput
* CreatePayload
* CreateInput
* CreateOutput
* UpdatePayload
* UpdateInput
* UpdateOutput
* DestroyInput

#### Customizing Input and Output

The following generic arguments using for input and output DTOs per CRUD operation:

| Operation |  Input         | Output             |
| --------- | -------------- | ------------------ |
| List      | ListInput      | PaginatedContainer |
| Retrieve  | RetrieveInput  | RetrieveOutput     |
| Create    | CreateInput    | CreateOutput       |
| Update    | UpdateInput    | UpdateOutput       |
| Destroy   | DestroyInput   | void               |

By default, generic arguments are base classes of input/output DTOs but more concrete constraints can be provided. 
In fact, generic arguments duplicate the arguments of the CRUD service that the controller uses.

#### Mapping request

To maintain universality and library agnostic, the HTTP request is converted from library-specific requests 
(Express, Fastify, etc.) to a common `Request` class. Default is Express. You can customize this by overriding 
`mapRequest` method.

#### Mapping input

Your request automatically maps to the relevant input DTOs but you can customize this by overriding one of the 
following methods:
`mapListInput` maps list input from request object.\
`mapRetrieveInput` maps retrieve input from request object.\
`mapCreateInput` maps create input from request object.\
`mapUpdateInput` maps update input from request object.\
`mapDestroyInput` maps destroy input from request object.
