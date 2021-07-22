# Queries

Using query object patterns, you can define rules for querying entities from the repository. This helps to avoid
repeating a ton of methods in the repository for filtering objects and abstract from concrete ORM implementation.

NestJS Boilerplate defines `BaseQuery` interface that can be extended to concrete ORM query implementation.

## Example

Let's define query interface for TypeORM.

```typescript
import { FindManyOptions } from 'typeorm';
import { BaseQuery } from '@nestjs-boilerplate/core';

export interface BaseFindQuery<E> extends BaseQuery {

    toFindOptions(): FindManyOptions<E>;

}
```

Now we can implement query.

```typescript
import { BaseFindQuery } from './base-find-many.query';
import { User } from './user.entity';

export class ActiveUsersRegisteredInYearQuery implements BaseFindQuery<User> {
    constructor(
        protected readonly year: string,
    ) {}

    toFindOptions(): FindManyOptions<User> {
        return {
            where: {
                isActive: true,
                registrationDate: this.year,
            }
        };
    }
}
```

Use created query in find method of repository.

```typescript
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ActiveUsersRegisteredInYearQuery } from './active-users-registeted-in-year.query';

export class UsersService {
    constructor(
        private readonly userRepository: Repository<User>,
    ) {}
    
    async getActiveUsersRegisteredInYear(year: string) {
        return this.userRepository.find(
            new ActiveUsersRegisteredInYearQuery(year).toFindOptions(),
        );
    }
}
```

**Use queries when:**
* Need to have reusable query expression in some code places.
* Want to have more readable/understandable names of queries
* Want to have a fewer methods in a custom repository, such as: getAllUsers, getActiveUsers, 
  getActiveUsersRegisteredInYear...
