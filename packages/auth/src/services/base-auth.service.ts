import { Repository } from 'typeorm';
import { EntityNotFoundException } from '@nestjs-boilerplate/core';
import { User, ActiveUsersQuery } from '@nestjs-boilerplate/user';
import { BaseLoginInput } from '../dto/base-login.input';
import { BaseLoginOutput } from '../dto/base-login.output';
import { BaseLogoutInput } from '../dto/base-logout.input';
import { BaseLogoutOutput } from '../dto/base-logout.output';

export abstract class BaseAuthService {

    protected constructor(
        protected readonly userRepository: Repository<User>,
    ) {}

    /**
     * Logs in a user with the given input.
     * @param input
     */
    abstract login(input: BaseLoginInput): Promise<BaseLoginOutput>;

    /**
     * Logs out a user with the given input.
     * @param input
     */
    abstract logout(input: BaseLogoutInput): Promise<BaseLogoutOutput>;

    /**
     * Finds a user by the given query.
     * @param query The query to find the user
     * @returns The found user
     * @throws EntityNotFoundException
     */
    protected async findUser(query: ActiveUsersQuery): Promise<User> {
        const user = await this.userRepository.findOne(query.toFindOptions());

        if (!user) {
            throw new EntityNotFoundException();
        }

        return user;
    }
}
