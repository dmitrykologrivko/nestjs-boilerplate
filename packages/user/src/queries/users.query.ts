import { FindOneOptions, FindManyOptions } from 'typeorm';
import { BaseFindOneQuery, BaseFindManyQuery } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';

export class UsersQuery implements BaseFindOneQuery<User>, BaseFindManyQuery<User> {
    constructor(
        protected meta: {
            id?: number;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
            isAdmin?: boolean;
            isSuperuser?: boolean;
            isActive?: boolean;
        },
    ) {}

    toFindOneOptions(): FindOneOptions<User> {
        const query: Record<string, any> = { where: {} };

        if (this.meta.id) {
            query.where.id = this.meta.id;
        }
        if (this.meta.username) {
            query.where.username = this.meta.username;
        }
        if (this.meta.email) {
            query.where.email = this.meta.email;
        }
        if (this.meta.firstName) {
            query.where.firstName = this.meta.firstName;
        }
        if (this.meta.lastName) {
            query.where.lastName = this.meta.lastName;
        }
        if (this.meta.isAdmin) {
            query.where.isAdmin = this.meta.isAdmin;
        }
        if (this.meta.isSuperuser) {
            query.where.isSuperuser = this.meta.isSuperuser;
        }
        if (this.meta.isActive) {
            query.where.isActive = this.meta.isActive;
        }

        return query;
    }

    toFindManyOptions(): FindManyOptions<User> {
        return this.toFindOneOptions();
    }
}
