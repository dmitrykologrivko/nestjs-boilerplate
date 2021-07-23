# Controllers

You can create regular controllers as you always do, NestJS Boilerplate contains some extra

## Decorators

### ApiController

`ApiController`

### ListFilter

### RetrieveFilter

### DestroyFilter

### Search

### SortBy

### Where

### LimitOffset

### Page

## Crud controller

NestJS Boilerplate defines abstract `CrudController` class which allows extended classes have the implementation of 
CRUD operations using the standard REST (GET, POST, PUT, PATCH, DELETE) methods.

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

### Base crud controller

NestJS Boilerplate defines abstract `BaseCrudController` class which is essentially a blueprint for implementing necessary CRUD operations.
`CrudController` class extends `BaseCrudController` class and expose all CRUD operation. If you need to have only some operations then you need to extend your controller class from `BaseCrudController` class.

```typescript
import { Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
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
    async list(@Req() req: Request) {
        return super.list(req);
    }

    @Post()
    async create(@Req() req: Request) {
        return super.create(req);
    }

    @Get(':id')
    async retrieve(@Req() req: Request) {
        return super.retrieve(req);
    }
}
```

`mapListInput`
`mapRetrieveInput`
`mapCreateInput`
`mapUpdateInput`
`mapDestroyInput`
