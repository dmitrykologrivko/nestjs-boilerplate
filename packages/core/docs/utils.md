# Utils

## Validation

NestJS Boilerplate uses [class-validator](https://github.com/typestack/class-validator) library to help you validate 
classes. Сheck out this library for more information on how to use validation tools.

NestJS Boilerplate contains `ClassValidator` class wrapper on class-validator library. It validates provided object
according to object`s class validation decorators and returns result object.

```typescript
import { MaxLength, MinLenght } from 'class-validator';
import { BaseEntityDto, ClassValidator } from '@nestjs-boilerplate/core';

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

const validationResult = ClassValidator.validate(UserDto, user);

// OUTPUT: true
console.log(validationResult.isOk());
```

Besides, you can use chainable functions to validate some argument or property. `Validate` class util for single 
properties is a wrapper on class-validator library for commonly used validators.

```typescript
import { Validate } from '@nestjs-boilerplate/core';

const validationResult = Validate.withProperty('username', 'johnsmith')
    .maxLength(128)
    .minLength(5)
    .isValid();

// OUTPUT: true
console.log(validationResult.isOk());
```

## Class transformation

NestJS Boilerplate uses [class-transformer](https://github.com/typestack/class-transformer) library to help you 
transform classes. Сheck out this library for more information on how to use class transformation tools.

NestJS Boilerplate contains `ClassTransformer` class wrapper on class-validator library. It transforms provided 
plain object to class object or viceverca.

For example we have an user entity.

```typescript
import { BaseEntity } from 'nestjs-boilerplate/core';

export class User extends BaseEntity {

    constructor(
        public username: string,
        public password: string,
        public firstName: string,
        public lastName: string,
    ) {}
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
console.log(isDefined({ foo: 'bar' });
```

## Monads

### Result Monad

Result monad is actually the container of the success or exception result. It allows describing a sequence of operations 
in a chain and does not care if some operation falls off with an exception. We will have to check the success of the 
operation only at the end of the execution of the entire chain. See more information about 
[exceptions handling](./exceptions-handling.md).

To start using this monad we need to wrap the function with `Result` container. Let's return `ArithmeticException` 
if we are trying to divide by zero.

```typescript
import { Result, ok, err } from '@nestjs-boilerplate/core';

class ArithmeticException extends Error {}

function divide(a: number, b: number): Result<number, ArithmeticException> {
    if (b === 0) {
        return err(new ArithmeticException('divide by zero'));
    }
    return ok(a / b);
}
```

For async functions, we need to wrap `Result` container by `Promise` class.

```typescript
import { Result, ok, err } from '@nestjs-boilerplate/core';
import { User } from './user.entity';

class LoginException extends Error {}

async function login(username: string, password: string): Promise<Result<User, LoginException>> {
    try {
        const response = await fetch('https://example.com/login', {
            method: 'POST',
            body: JSON.stringify({
                login,
                password,
            }),
        });
        const user = await response.json();
        return ok(user);
    } catch (e) {
        return err(new LoginException(e.message));
    }
}
```

#### ok

Returns `Result` with type `ResultType.OK` and contains success result value.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: Result<string, unknown> = ok('success');
```

#### err

Returns `Result` with type `ResultType.ERR` and contains exception result value.

```typescript
import { Result, err } from '@nestjs-boilerplate/core';

const value: Result<unknown, Error> = err(new Err());
```

#### isOk

Returns `true` if `Result` with type `ResultType.OK`.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: boolean = ok(2 + 2).isOk();
```

#### isErr

Returns `true` if `Result` with type `ResultType.ERR`.

```typescript
import { Result, err } from '@nestjs-boilerplate/core';

const value: boolean = err(new Error()).isErr();
```

#### map

Returns mapped value wrapped by `Result`.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: Result<string, unknown> = ok(2 + 2).map(value => value.toString());
```

If your function returns `Promise<Result<T, E>>` and you want to map value within async chain then use `map` function.

```typescript
import { Result, map } from '@nestjs-boilerplate/core';
import { User } from './user.entity';
import { login, LoginException } from './api.utils';

login('johnsmith', 'eskf24!sdkfs*')
    .then(map(user => Promise.resolve(user.username)))
    .then(result => console.log(result.isOk ? result.unwrap() : result.unwrapErr()));
```

#### mapAsync

Returns mapped value wrapped by `Promise<Result<T, E>>`.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: Promise<Result<string, unknown>> = ok(2 + 2).mapAsync(value => Promise.resolve(value.toString()));
```

#### mapErr

Returns mapped exception wrapped by `Result`.

```typescript
import { Result, err } from '@nestjs-boilerplate/core';

const value: Result<unknown, string> = err(new Error()).mapErr(value => value.toString());
```

If your function returns `Promise<Result<T, E>>` and you want to map exception within async chain then use 
`mapErr` function.

```typescript
import { Result, mapErr } from '@nestjs-boilerplate/core';
import { User } from './user.entity';
import { login, LoginException } from './api.utils';

login('johnsmith', 'eskf24!sdkfs*')
    .then(mapErr(loginException => new Error()))
    .then(result => console.log(result.isOk ? result.unwrap() : result.unwrapErr()));
```

#### mapErrAsync

Returns mapped exception wrapped by `Promise<Result<T, E>>`.

```typescript
import { Result, err } from '@nestjs-boilerplate/core';

const value: Promise<Result<unknown, string>> = err(new Error()).mapErrAsync(ex => Promise.resolve(ex.toString()));
```

#### proceed

Returns `Result<U, E | V>` which allows you to run the next operation or build a chain of operations.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: Result<string, unknown> = ok(2 + 2)
    .proceed(value => ok(value * 2))
    .proceed(value => ok(value.toString()));
```

If your function returns `Promise<Result<T, E>>` and you want to continue chain of operations within async chain 
then use `proceed` function.

```typescript
import { Result, proceed } from '@nestjs-boilerplate/core';
import { User } from './user.entity';
import { login, createPost } from './api.utils';

login('johnsmith', 'eskf24!sdkfs*')
    .then(proceed(accessToken => createPost(accessToken, 'This is the brand new post!')))
    .then(result => console.log(result.isOk ? result.unwrap() : result.unwrapErr()));
```

#### proceedAsync

Returns `Promise<Result<U, E | V>>` which allows you to run the next operation asynchronously.

```typescript
import { Result, ok } from '@nestjs-boilerplate/core';

const value: Promise<Result<number, unknown>> = ok(2 + 2)
    .proceedAsync(value => Promise.resolve(ok(value * 2)));
```

#### fallback

Returns `Result<T, E>` if the previous operation was failed with an exception. Basically it offers fallback action.

```typescript
import { Result, ok, err } from '@nestjs-boilerplate/core';

const value: Result<number, unknown> = err(new Error()).fallback(e => ok(2 + 2));
```

If your function returns `Promise<Result<T, E>>` and you want to have fallback action within async chain 
then use `fallback` function.

```typescript
import { Result, fallback } from '@nestjs-boilerplate/core';
import { User } from './user.entity';
import { getUser, login } from './api.utils';

getUser()
    .then(fallback(e => login('johnsmith', 'eskf24!sdkfs*')))
    .then(result => console.log(result.isOk ? result.unwrap() : result.unwrapErr()));
```

#### fallbackAsync

Returns `Promise<Result<T, E>>` if the previous operation was failed with an exception. Basically it offers asynchronous 
fallback action.

```typescript
import { Result, ok, err } from '@nestjs-boilerplate/core';

const value: Promise<Result<number, unknown>> = err(new Error()).fallbackAsync(e => Promise.resolve(ok(2 + 2)));
```

#### merge

Returns `Result<[T1, T2, ...T10], E1, E2, ...E10>` which allows you to merge several operations `Result<T, E>` into one 
if all operations were successful.

```typescript
import { Result, ok, merge } from '@nestjs-boilerplate/core';

const funcOne = ok<number, Error>(2);
const funcTwo = ok<string, TypeError>('test');

const value: Result<[number, string], Error | TypeError> = merge([funcOne, funcTwo]);
```

#### mergeAsync

Returns `Promise<Result<[T1, T2, ...T10], E1, E2, ...E10>>` which allows you to merge several asynchronous operations
`Promise<Result<T, E>>` into one if all operations were successful.

```typescript
import { Result, ok, mergeAsync } from '@nestjs-boilerplate/core';

const funcOne = Promise.resolve(ok<number, Error>(2));
const funcTwo = Promise.resolve(ok<string, TypeError>('test'));

const value: Promise<Result<[number, string], Error | TypeError>> = mergeAsync([funcOne, funcTwo]);
```
