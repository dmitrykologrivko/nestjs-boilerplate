import { FindManyOptions } from 'typeorm';
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

    toFindOptions(): FindManyOptions<User> {
        const query: Record<string, any> = super.toFindOptions();

        query.where._isActive = true;

        return query;
    }
}
