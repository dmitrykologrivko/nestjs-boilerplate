# Utils

## Validation

NestJS Boilerplate uses [class-validator](https://github.com/typestack/class-validator) library to help you validate 
classes. Сheck out this library for more information on how to use validation tools.

NestJS Boilerplate contains `ClassValidator` class wrapper on class-validator library. It validates provided object
according to object`s class validation decorators, throws ValidationContainerException if validation is not passed.

```typescript
import { MaxLength, MinLenght } from 'class-validator';
import { BaseEntityDto, ClassValidator, ValidationContainerException } from '@nestjs-boilerplate/core';

export class UserDto extends BaseEntityDto {

    @MaxLength(128)
    @MinLength(5)
    username: string;

    @MaxLength(128)
    @MinLength(8)
    password: string;

    @MaxLength(255)
    @MinLength(2)
    firstName: string;

    @MaxLength(255)
    @MinLength(2)
    lastName: string;

    @MaxLength(255)
    patronymic: string;

}

const user = new UserDto();

user.username = 'johnsmith';
user.password = 'wvsvs23gfw@gs';
user.firstName = 'John';
user.lastName = 'Smith';

try {
    ClassValidator.validate(UserDto, user);
    console.log('Valid input');
} catch (e: ValidationContainerException) {
    console.log(`Validation errors: ${e.toString()}`);
}
```

Besides, you can use chainable functions to validate some argument or property. `Validate` class util for single 
properties is a wrapper on class-validator library for commonly used validators.

```typescript
import { Validate } from '@nestjs-boilerplate/core';

const isValidInput = Validate.withProperty('username', 'johnsmith')
    .maxLength(128)
    .minLength(5)
    .isValid();

console.log(`Input is${isValidInput ? '' : ' not'} valid`);
```

## Class transformation

NestJS Boilerplate uses [class-transformer](https://github.com/typestack/class-transformer) library to help you 
transform classes. Check out this library for more information on how to use class transformation tools.

NestJS Boilerplate contains `ClassTransformer` class wrapper on class-validator library. It transforms provided 
plain object to class object or viceverca.

For example, we have user entity.

```typescript
import { BaseEntity } from 'nestjs-boilerplate/core';

export class User extends BaseEntity {

    constructor(
        public username: string,
        public password: string,
        public firstName: string,
        public lastName: string,
    ) {
        super();
    }
}
```

We create a DTO class where expose the only fields, required for the presentation layer excluding sensitive fields 
like a password.

```typescript
import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class UserDto extends BaseEntityDto {

    @Expose()
    username: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

}
```

Now we can transform entity to dto using `ClassTransformer` util.

```typescript
import { ClassTransformer } from '@nestjs-boilerplate/core';
import { User } from './user.entity';
import { UserDto } from './user.dto';

const user = new User('johnsmith', 'qdq143fcf*7', 'John', 'Smith');

// To DTO
const dto = ClassTransformer.toClassObject(UserDto, user);
```

## Preconditions

NestJS Boilerplate contains precondition functions that can be useful in certain cases.

`all` function checks if all items of array are defined.

```typescript
import { all } from '@nestjs-boilerplate/core';

// OUTPUT: true
console.log(all([1, true, 'test-string']));
```

`any` function checks if any item of array is defined.

```typescript
import { any } from '@nestjs-boilerplate/core';

// OUTPUT: true
console.log(any([1, false, '']));
```

`isEmpty` function checks if provided string, array, map or set is undefined or empty

```typescript
import { isEmpty } from '@nestjs-boilerplate/core';

// OUTPUT: true
console.log(isEmpty(''));
```

`isNotEmpty` function checks if provided string, array, map or set is defined and not empty

```typescript
import { isEmpty } from '@nestjs-boilerplate/core';

// OUTPUT: true
console.log(isEmpty('test-string'));
```

`isDefined` function checks if provided argument is defined (!== undefined, !== null).

```typescript
import { isDefined } from '@nestjs-boilerplate/core';

// OUTPUT: true
console.log(isDefined({ foo: 'bar' }));
```
