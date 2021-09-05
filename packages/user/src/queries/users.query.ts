import { FindManyOptions } from 'typeorm';
import { BaseFindQuery } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';

export class UsersQuery implements BaseFindQuery<User> {
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

    toFindOptions(): FindManyOptions<User> {
        const query: Record<string, any> = { where: {} };

        if (this.meta.id) {
            query.where.id = this.meta.id;
        }
        if (this.meta.username) {
            query.where._username = this.meta.username;
        }
        if (this.meta.email) {
            query.where._email = this.meta.email;
        }
        if (this.meta.firstName) {
            query.where._firstName = this.meta.firstName;
        }
        if (this.meta.lastName) {
            query.where._lastName = this.meta.lastName;
        }
        if (this.meta.isAdmin) {
            query.where._isAdmin = this.meta.isAdmin;
        }
        if (this.meta.isSuperuser) {
            query.where._isSuperuser = this.meta.isSuperuser;
        }
        if (this.meta.isActive) {
            query.where._isActive = this.meta.isActive;
        }

        return query;
    }
}