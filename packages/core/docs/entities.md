# Entities

Entities are one of the building blocks of Domain Driven Design. "It is an object that is not defined by its attributes,
but rather by a thread of continuity and its identity." (Eric Evans)

In short: entities are objects that have ids and can be mapped to a table in a relational database. Entities of the 
same type are equals if their ids are matched even if all the properties are different.

## Base Entity

NestJS Boilerplate defines `BaseEntity` class which implements `Identifiable` interface.

```typescript
import { BaseEntity } from '@nestjs-boilerplate/core';

export class Note extends BaseEntity {

    note: string;

}
```

The Note class is defined as an entity. It has an **id** and **note** properties.\
**id** field inherited from `BaseEntity` class and has `number` type by default.

You can customize the type of **id** field by providing the type explicitly to `BaseEntity` class.

```typescript
import { BaseEntity } from '@nestjs-boilerplate/core';

export class Note extends BaseEntity<string> {

    note: string;

}
```

## Aggregation Root

Aggregate is a group of objects that are bound together by a root entity: the aggregate root. Objects outside 
the aggregate are allowed to hold references to the root but not to any other object of the aggregate. 
The aggregate root is responsible for checking the consistency of changes in the aggregate.

Another formulation described Martin Fowler: "Aggregate is a pattern in Domain-Driven Design. A DDD aggregate is a cluster of domain objects that can be treated 
as a single unit. An example may be an order and its line-items, these will be separate objects, but it's useful 
to treat the order (together with its line items) as a single aggregate."

NestJS Boilerplate defines `BaseRootEntity` class which extends `BaseEntity` class. You are free to choose whether 
to use aggregation roots in your application or not.

## Additional interfaces

You might need additional often using fields for your entities. NestJS Boilerplate contains some helpful built-in 
interfaces.

### TimeStamped interface

TimeStamped interface brings `created` and `updated` timestamp fields. It can be helpful to track what time when
an entity was created or updated.

```typescript
import { BaseEntity, TimeStamped } from '@nestjs-boilerplate/core';

export class Note extends BaseEntity implements TimeStamped {

    note: string;

    created: Date;

    updated: Date;

}
```

### SoftDeletable interface

SoftDeletable interface brings `deleted` timestamp field. It can be helpful to check if an entity was marked 
as deleted and when it happened.

```typescript
import { BaseEntity, SoftDeletable } from '@nestjs-boilerplate/core';

export class Note extends BaseEntity implements SoftDeletable {

    note: string;

    deleted: Date;

}
```

## Storing Entities in database

When it comes to the database, you need to map an entity to a table in a relational database. You can use an existing 
entity class or create another class for database table representation. The second approach may seem more correct since
we do not mix the infrastructural things of the database, and the domain model, but this can be a more time-consuming 
process and sometimes not justified.

The following example maps entity properties to database columns.

```typescript
import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Entity, BaseEntity, TimeStamped } from '@nestjs-boilerplate/core';

@Entity()
export class Note extends BaseEntity implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column()
    note: string;

}
```

NestJS Boilerplate contains built-in classes with predefined database columns mapping you can use them in the case
when you decided to mix entity class and database columns mapping.

`BaseTypeormEntity` extends `BaseEntity` and implements `TimeStamped` interface.\
`BaseRootTypeormEntity` extends `BaseRootEntity` and implements `TimeStamped` interface.\
`BaseSoftDeletableTypeormEntity` extends `BaseEntity` and implements `TimeStamped` and `SoftDeletable` interfaces.\
`BaseSoftDeletableRootTypeormEntity` extends `BaseRootEntity` and implements `TimeStamped` and `SoftDeletable` interfaces.