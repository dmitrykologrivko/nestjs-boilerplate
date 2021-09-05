import { Repository } from 'typeorm';
import { Result, ok, err, EntityNotFoundException } from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';
import { BaseLoginInput } from '../dto/base-login.input';
import { BaseLoginOutput } from '../dto/base-login.output';
import { BaseLogoutInput } from '../dto/base-logout.input';
import { BaseLogoutOutput } from '../dto/base-logout.output';
import { ActiveUsersQuery } from '../queries/active-users.query';

export abstract class BaseAuthService {

    protected constructor(
        protected readonly userRepository: Repository<User>,
    ) {}

    abstract login(input: BaseLoginInput): Promise<Result<BaseLoginOutput, any>>;

    abstract logout(input: BaseLogoutInput): Promise<Result<BaseLogoutOutput, any>>;

    protected async findUser(query: ActiveUsersQuery): Promise<Result<User, EntityNotFoundException>> {
        const user = await this.userRepository.findOne(query.toFindOptions());

        if (!user) {
            return err(new EntityNotFoundException());
        }

        return ok(user);
    }
}
