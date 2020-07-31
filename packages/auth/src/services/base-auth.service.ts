import { Repository } from 'typeorm';
import { Result, Ok, Err } from '@nest-boilerplate/core';
import { User } from '../entities/user.entity';
import { BaseLoginInput } from '../dto/base-login.input';
import { BaseLoginOutput } from '../dto/base-login.output';
import { BaseLogoutInput } from '../dto/base-logout.input';
import { BaseLogoutOutput } from '../dto/base-logout.output';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';

export abstract class BaseAuthService {

    protected constructor(
        protected readonly userRepository: Repository<User>,
    ) {}

    async login(input: BaseLoginInput): Promise<Result<BaseLoginOutput, any>> {
        throw new Error('Login method is not implemented');
    }

    async logout(input: BaseLogoutInput): Promise<Result<BaseLogoutOutput, any>> {
        throw new Error('Logout method is not implemented');
    }

    protected async findUser(username: string): Promise<Result<User, UserNotFoundException>> {
        const user = await this.userRepository.findOne({
            where: { _username: username, _isActive: true },
        });

        if (!user) {
            return Err(new UserNotFoundException());
        }

        return Ok(user);
    }
}
