import { FindManyOptions } from 'typeorm';
import { BaseFindQuery } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';

export class ActiveUsersQuery implements BaseFindQuery<User> {
    constructor(
        private meta: {
            username?: string;
            email?: string;
        },
    ) {}

    toFindOptions(): FindManyOptions<User> {
        const query: Record<string, any> = {
            where: {
                _isActive: true,
            },
        };

        if (this.meta.username) {
            query.where._username = this.meta.username;
        }
        if (this.meta.email) {
            query.where._email = this.meta.email;
        }

        return query;
    }
}
