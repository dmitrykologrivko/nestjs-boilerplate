import { FindOneOptions, FindManyOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersQuery } from './users.query';

export class ActiveUsersQuery extends UsersQuery {
    constructor(
        protected meta: {
            id?: number;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
            isAdmin?: boolean;
            isSuperuser?: boolean;
        },
    ) {
        super(meta);
    }

    toFindOneOptions(): FindOneOptions<User> {
        const query: Record<string, any> = super.toFindOneOptions();

        query.where.isActive = true;

        return query;
    }

    toFindManyOptions(): FindManyOptions<User> {
        return this.toFindOneOptions();
    }
}
