# DTO

DTO (Data Transfer Objects) are used to transfer data between the Application Layer and the Presentation Layer.
When you use DTOs you achieve abstraction of the domain layer, hide sensitive data, can have another data structure. 

The following advantages can be attributed to the use of DTOs:
* Abstraction of the domain entities
* Hidding sensetive data

## Example

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

## Base DTO

NestJS Boilerplate defines a simple `BaseDto` class you can extend your DTOs from this class to have a common abstract 
interface.

## Base Entity DTO

NestJS Boilerplate defines `BaseEntityDto` class which extends `BaseDto` class and contains **id** property, since this 
common for most entities.

Also, you can use `BaseTimeStampedEntityDto` which extends `BaseEntityDto` and implements `TimeStamped` interface.
Thus contains **id**, **created**, **updated** properties.

## Base Input

NestJS Boilerplate defines `BaseInput` class which extends `BaseDto` class and contains **extra** property intended for 
adding arguments dynamically. You can extend your input DTOs from this class.

Also, you can use `BasePayloadInput` which extends `BaseInput` class and contains **payload** property. You can use this 
class to provide the payload object in the input along with other input arguments.
