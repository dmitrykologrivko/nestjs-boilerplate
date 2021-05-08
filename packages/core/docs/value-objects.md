# Value Objects

Value objects another irreplaceable building blocks of Domain Driven Design. "An object that represents a descriptive 
aspect of the domain with no conceptual identity is called a value object." (Eric Evans)

In short: Value objects have not ids as opposed to entities. It may contain business logic because it is another type 
of domain object. If all properties of a value object are equal to another value object, then these value objects equal
to each other, in contrast to entities where equality is checked by an id.

## Base Value Object

NestJS Boilerplate defines `BaseValueObject` class.

```typescript
import { BaseValueObject } from '@nestjs-boilerplate/core';

class Address extends BaseValueObject {
    
    address1: string;
    
    address2: string;
    
    zipCode: string;
    
    city: string;
    
    country: string;
    
}
```

**Note:** The best practice designing value objects as immutable objects.

## Value Objects in Entities

It is familiar to divide some properties of an entity into value objects by conceptual values. For example address 
can be value object of person entity.

```typescript
import { BaseEntity } from '@nestjs-boilerplate/core';
import { Address } from './address.value-object'

export class Person extends BaseEntity {

    name: string;
    
    age: number;
    
    address: Address;

}
```

## Storing Value Objects in database

What if your entity class mixed with a database table entity? NestJS Boilerplate has solution for this.

### Embedded value objects

You can embed value objects into an entity's database table. Firstly, you need to mark value objects properties 
with `Column` decorator from `typeorm` package.

```typescript
import { Column } from 'typeorm';
import { BaseValueObject } from '@nestjs-boilerplate/core';

class Address extends BaseValueObject {

    @Column()
    address1: string;

    @Column()
    address2: string;

    @Column()
    zipCode: string;

    @Column()
    city: string;

    @Column()
    country: string;

}
```

Then you need to use `Embedded` decorator from `@nestjs-boilerplate/core` package for value object property in entity. 
This will merge value object columns into the current entity's database table.

```typescript
import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Entity, BaseEntity, Embedded } from '@nestjs-boilerplate/core';
import { Address } from './address.value-object'

@Entity()
export class Person extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column()
    age: number;
    
    @Embedded(() => Address)
    address: Address;

}
```

### Separated value objects

In cases when you need to store value object in separated database table you can extend it from `BaseElement` class and
mark with `Element` decorator.

```typescript
import { Column } from 'typeorm';
import { Element, BaseElement } from '@nestjs-boilerplate/core';
import { Person } from './person.entity';

@Element({
    single: true,
    parent: Person,
})
class Address extends BaseElement {

    @Column()
    address1: string;

    @Column()
    address2: string;

    @Column()
    zipCode: string;

    @Column()
    city: string;

    @Column()
    country: string;

}
```

**Note:** `BaseElement` class extends `BaseValueObject` class.

In entity mark value object property with `SingleElement` decorator.

```typescript
import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Entity, BaseEntity, SingleElement } from '@nestjs-boilerplate/core';
import { Address } from './address.value-object'

@Entity()
export class Person extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column()
    age: number;
    
    @SingleElement(() => Address)
    address: Address;

}
```

### List of value objects

You can store a list of related value objects to an entity. Extend value object from `BaseElement` class and mark with 
`Element` decorator. Elements of the list will be stored in the separated table.

```typescript
import { Column } from 'typeorm';
import { Element, BaseElement } from '@nestjs-boilerplate/core';
import { Person } from './person.entity';

@Element({ parent: Person })
class Address extends BaseElement {

    @Column()
    address1: string;

    @Column()
    address2: string;

    @Column()
    zipCode: string;

    @Column()
    city: string;

    @Column()
    country: string;

}
```

**Note:** `BaseElement` class extends `BaseValueObject` class.

In entity mark value object property with `ElementCollection` decorator.

```typescript
import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Entity, BaseEntity, ElementCollection } from '@nestjs-boilerplate/core';
import { Address } from './address.value-object'

@Entity()
export class Person extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @Column()
    age: number;
    
    @ElementCollection(() => Address)
    addresses: Address[];

}
```