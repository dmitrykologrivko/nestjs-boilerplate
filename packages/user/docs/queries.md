# Queries

You can use predefined queries related to the User entity. (See more on queries [here](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/queries.md))

## Users Query

`UsersQuery` class provides a batch of parameters that can be used to filter users such as id, username, email,
firstName, lastName, isAdmin, isSuperuser, isActive.

In the following example `UsersQuery` converts to `FindOptions` and used in Typeorm repository.

```typescript
import { Repository } from 'typeorm';
import { InjectRepository, DomainService } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';
import { UsersQuery } from '../queries/users.query';

@DomainService()
export class UserVerificationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async isEmailUnique(email: string): Promise<boolean> {
        const query = new UsersQuery({ email }).toFindOptions();
        return await this.userRepository.count(query) === 0;
    }

    async isEmailActive(email: string): Promise<boolean> {
        const query = new UsersQuery({ email, isActive: true }).toFindOptions();
        return await this.userRepository.findOne(query) !== undefined;
    }
}
```

## Active Users Query

`ActiveUsersQuery` class provides the same batch of parameters that `UsersQuery` except isActive because it has true 
value by default.