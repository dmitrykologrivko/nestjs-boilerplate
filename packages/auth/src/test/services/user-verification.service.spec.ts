import { Repository } from 'typeorm';
import { MockProxy, mock } from 'jest-mock-extended';
import { User } from '../../entities/user.entity';
import { UserVerificationService } from '../../services/user-verification.service';
import { UserFactory } from '../user.factory';

describe('UserVerificationService', () => {
    const ID = 1;
    const EMAIL = 'test@test.com';
    const USERNAME = UserFactory.DEFAULT_USERNAME;
    const PASSWORD = UserFactory.DEFAULT_PASSWORD;
    const EMAIL_QUERY = { where: { _email: EMAIL } };
    const EMAIL_ACTIVE_QUERY = { where: { _email: EMAIL, _isActive: true } };
    const USERNAME_QUERY = { where: { _username: USERNAME } };

    let service: UserVerificationService;
    let userRepository: MockProxy<Repository<User>>;

    let user: User;

    beforeEach(async () => {
        userRepository = mock<Repository<User>>();

        // TODO: https://github.com/marchaos/jest-mock-extended/issues/36
        // @ts-ignore
        service = new UserVerificationService(userRepository);

        user = await UserFactory.makeUser();
    });

    describe('#isEmailUnique()',  () => {
        it('when email is unique should return true', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(0));

            const result = await service.isEmailUnique(EMAIL);

            expect(result).toBe(true);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(EMAIL_QUERY);
        });

        it('when email is not unique should return false', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(1));

            const result = await service.isEmailUnique(EMAIL);

            expect(result).toBe(false);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(EMAIL_QUERY);
        });
    });

    describe('#isEmailActive()',  () => {
        it('when email is active should return true', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.isEmailActive(EMAIL);

            expect(result).toBe(true);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(EMAIL_ACTIVE_QUERY);
        });

        it('when email is not active should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(undefined));

            const result = await service.isEmailActive(EMAIL);

            expect(result).toBe(false);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(EMAIL_ACTIVE_QUERY);
        });
    });

    describe('#isUsernameUnique()',  () => {
        it('when username is unique should return true', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(0));

            const result = await service.isUsernameUnique(USERNAME);

            expect(result).toBe(true);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when username is not unique should return false', async () => {
            userRepository.count.mockReturnValue(Promise.resolve(1));

            const result = await service.isUsernameUnique(USERNAME);

            expect(result).toBe(false);
            expect(userRepository.count.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });

    describe('#isUsernameExists()',  () => {
        it('when username exists should return true', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(user));

            const result = await service.isUsernameExists(USERNAME);

            expect(result).toBe(true);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });

        it('when username does not exist should return false', async () => {
            userRepository.findOne.mockReturnValue(Promise.resolve(undefined));

            const result = await service.isUsernameExists(USERNAME);

            expect(result).toBe(false);
            expect(userRepository.findOne.mock.calls[0][0]).toStrictEqual(USERNAME_QUERY);
        });
    });
});
