import { Repository } from 'typeorm';
import {
    InjectRepository,
    DomainService,
    isDefined
} from '@nestjs-boilerplate/core';
import { User } from '../entities/user.entity';
import { UsersQuery } from '../queries/users.query';

@DomainService()
export class UserVerificationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async isEmailUnique(email: string): Promise<boolean> {
        const query = new UsersQuery({ email }).toFindManyOptions();
        return await this.userRepository.count(query) === 0;
    }

    async isEmailActive(email: string): Promise<boolean> {
        const query = new UsersQuery({ email, isActive: true }).toFindManyOptions();
        return isDefined(await this.userRepository.findOne(query));
    }

    async isUsernameUnique(username: string): Promise<boolean> {
        const query = new UsersQuery({ username }).toFindManyOptions();
        return await this.userRepository.count(query) === 0;
    }

    async isUsernameExists(username: string): Promise<boolean> {
        const query = new UsersQuery({ username }).toFindManyOptions();
        return isDefined(await this.userRepository.findOne(query));
    }
}
