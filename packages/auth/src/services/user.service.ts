import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import {
    PropertyConfigService,
    InjectRepository,
    ApplicationService,
    ClassTransformer,
    ClassValidator,
    ValidationContainerException,
    Result,
    Ok,
    Err,
} from '@nestjs-boilerplate/core';
import { AUTH_PASSWORD_SALT_ROUNDS_PROPERTY } from '../constants/auth.properties';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { User } from '../entities/user.entity';
import { UserPasswordService } from './user-password.service';
import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserOutput } from '../dto/create-user.output';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForceChangePasswordInput } from '../dto/force-change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { FindUserInput } from '../dto/find-user.input';
import { FindUserOutput } from '../dto/find-user.output';

type CreateUserResult = Promise<Result<CreateUserOutput, ValidationContainerException>>;
type ChangePasswordResult = Promise<Result<void, ValidationContainerException>>;
type ForceChangePasswordResult = Promise<Result<void, ValidationContainerException>>;
type ForgotPasswordResult = Promise<Result<void, ValidationContainerException>>;
type ResetPasswordResult = Promise<Result<void, ValidationContainerException>>;
type FindUserResult = Promise<Result<FindUserOutput, UserNotFoundException>>;

@ApplicationService()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly passwordService: UserPasswordService,
        private readonly config: PropertyConfigService,
    ) {}

    /**
     * Creates a new user entity
     * @param input create user dto
     * @return user dto
     */
    async createUser(input: CreateUserInput): CreateUserResult {
        const validateResult = await ClassValidator.validate(CreateUserInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const createUserResult = await User.create(
            input.username,
            input.password,
            input.email,
            input.firstName,
            input.lastName,
            input.isActive,
            input.isAdmin,
            input.isSuperuser,
            this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY),
        );

        const user = await this.userRepository.save(createUserResult.unwrap());

        const output = ClassTransformer.toClassObject(CreateUserOutput, user);

        return Ok(output);
    }

    /**
     * Allows changing the user password if provided current password is correct
     * @param input change password dto
     */
    async changePassword(input: ChangePasswordInput): ChangePasswordResult {
        const validateResult = await ClassValidator.validate(ChangePasswordInput, input);

        if (validateResult.is_err()) {
            return validateResult;
        }

        const user = await this.userRepository.findOne(input.userId);
        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));
        await this.userRepository.save(user);

        Logger.log(`Password has been changed for ${user.username}`);

        return Ok(null);
    }

    /**
     * Allows force changing the user password
     * @param input force change password dto
     */
    async forceChangePassword(input: ForceChangePasswordInput): ForceChangePasswordResult {
        const validateResult = await ClassValidator.validate(ForceChangePasswordInput, input);

        if (validateResult.is_err()) {
            return validateResult;
        }

        const user = await this.userRepository.findOne({ where: { _username: input.username } });
        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));
        await this.userRepository.save(user);

        Logger.log(`Password has been changed for ${user.username}`);

        return Ok(null);
    }

    /**
     * Generates reset password token and sends to user email
     * @param input forgot password dto
     */
    async forgotPassword(input: ForgotPasswordInput): ForgotPasswordResult {
        const validateResult = await ClassValidator.validate(ForgotPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const user = await this.userRepository.findOne({ where: { _email: input.email } });

        const token = await this.passwordService.generateResetPasswordToken(user);

        // TODO: Send email
        Logger.debug(`(DEBUG) Reset token: ${token}`);
        Logger.log(`Recover password email has been sent for ${user.username}`);

        return Ok(null);
    }

    /**
     * Resets user password by reset password token
     * @param input reset password dto
     */
    async resetPassword(input: ResetPasswordInput): ResetPasswordResult {
        const validateResult = await ClassValidator.validate(ResetPasswordInput, input);

        if (validateResult.is_err()) {
            return Err(validateResult.unwrap_err());
        }

        const verifyTokenResult = await this.passwordService.validateResetPasswordToken(input.resetPasswordToken);

        const user = verifyTokenResult.unwrap();
        await user.setPassword(input.newPassword, this.config.get(AUTH_PASSWORD_SALT_ROUNDS_PROPERTY));
        await this.userRepository.save(user);

        Logger.log(`Password has been recovered for ${user.username}`);

        return Ok(null);
    }

    /**
     * Finds user by provided filters
     * @param input find user dto
     * @return user dto
     */
    async findUser(input: FindUserInput): FindUserResult {
        const user = await this.userRepository.findOne({
            where: { _username: input.username },
        });

        if (!user) {
            return Err(new UserNotFoundException());
        }

        const output = ClassTransformer.toClassObject(FindUserOutput, user);

        return Ok(output);
    }
}
