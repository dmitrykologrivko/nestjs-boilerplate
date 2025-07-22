import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { EntityNotFoundException } from '@nestjs-boilerplate/core';
import { User, ActiveUsersQuery } from '@nestjs-boilerplate/user';
import { BaseLoginInput } from '../../dto/base-login.input';
import { BaseLoginOutput } from '../../dto/base-login.output';
import { BaseLogoutInput } from '../../dto/base-logout.input';
import { BaseLogoutOutput } from '../../dto/base-logout.output';
import { BaseAuthService } from '../../services/base-auth.service';

describe('BaseAuthService', () => {
    class TestAuthService extends BaseAuthService {
        constructor(testUserRepository: Repository<User>) {
            super(testUserRepository);
        }

        login(_: BaseLoginInput): Promise<BaseLoginOutput> {
            return Promise.resolve({ token: 'dummy' });
        }

        logout(_: BaseLogoutInput): Promise<BaseLogoutOutput> {
            return Promise.resolve({ success: true });
        }

        public testFindUser(query: ActiveUsersQuery): Promise<User> {
            return this.findUser(query);
        }
    }

    let userRepository: MockProxy<Repository<User>>;
    let service: TestAuthService;

    beforeEach(() => {
        userRepository = mock<Repository<User>>();
        service = new TestAuthService(userRepository);
    });

    describe('#findUser()', () => {
        it('should return user if found', async () => {
            const user = {id: 1} as User;
            const query = mock<ActiveUsersQuery>();

            query.toFindOneOptions.mockReturnValue({});
            userRepository.findOne.mockResolvedValue(user);

            await expect(service.testFindUser(query)).resolves.toBe(user);

            expect(userRepository.findOne).toHaveBeenCalledWith({});
        });

        it('should throw EntityNotFoundException if user not found', async () => {
            const query = mock<ActiveUsersQuery>();

            query.toFindOneOptions.mockReturnValue({});
            userRepository.findOne.mockResolvedValue(undefined);

            await expect(service.testFindUser(query)).rejects.toBeInstanceOf(EntityNotFoundException);
        });
    });
});
