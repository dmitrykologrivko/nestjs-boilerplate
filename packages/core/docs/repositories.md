# Repositories

The Repository pattern is a facade for data access. Repository implements a mechanism for storing, retrieving, and
searching for objects in a data source. "Mediates between the domain and data mapping layers using a collection-like 
interface for accessing domain objects" (Martin Fowler).

In practice, repositories are used to perform database operations for domain objects (Entity and Value types).
Should separate repositories for each Entity or Aggregate Root.

## Repositories in NestJS Boilerplate

NestJS Boilerplate is not designed to be independent of a particular ORM or another technique to access a database.
It uses [TypeORM](https://typeorm.io/#/) out-of-the-box, most parts of framework uses the power of this ORM. 
TypeORM has implementation of [repository](https://typeorm.io/#/working-with-repository) pattern for basic 
CRUD operations and allows to create a custom repositories.

## Separating the domain objects and database entities

You may also face the thought of separating the domain objects (Entity and Value types) and database entities.
You might think that ideally, we should always do it, but in reality, it is not necessary and not always suitable 
for all projects. If you have a simple project, or the speed of development is important to you, then this separation 
can increase the time overhead. Moreover, TypeORM provides a convenient ORM API that allows for combining domain 
objects and database entities. NestJS Boilerplate also has some extra helpful tools complementary to the basic 
functionality of TypeORM. (See storing [entities](./entities.md) and [values objects](./value-objects.md)
in the database)

If you still want to implement separation then you can create a custom repository and extend this
from `BaseWritableRepository` class.

```typescript
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseWritableRepository, InjectRepository } from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteWritable } from './note.writable';

@Injectable()
export class NoteRepository extends BaseWritableRepository<Note, NoteWritable> {
    constructor(
        @InjectRepository(NoteWritable)
        repository: Repository<NoteWritable>,
    ) {
        super(repository, NoteWritable);
    }
    
    protected toEntity(writable: NoteWritable): Note {
        return writable.toEntity();
    }

    protected toWritable(entity: Note): NoteWritable {
        return NoteWritable.fromEntity(entity);
    }
}
```

Please **note** that using such repositories imposes restrictions on some built-in NestJS Boilerplate tools
that only work with TypeORM repositories. You will have to implement the use of this type of repositories yourself
with tools that do not support them.

Also, you will need to be sure to use [query](./queries.md) objects to search for an entity in the database because 
it needs to translate domain entity query expression to database query.
