import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import {
    PropertyConfigService,
    InjectRepository,
    ApplicationService,
    ClassTransformer,
    ClassValidator,
    BaseMailService,
    MAIL_PROPERTY,
    BaseTemplateService,
    transaction,
    EventBus,
} from '@nestjs-boilerplate/core';
import {
    USER_PROPERTY,
    USER_PASSWORD_SALT_ROUNDS_PROPERTY,
} from '../constants/user.properties';
import { User } from '../entities/user.entity';
import { ActiveUsersQuery } from '../queries/active-users.query';
import { UserPasswordService } from './user-password.service';
import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserOutput } from '../dto/create-user.output';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForceChangePasswordInput } from '../dto/force-change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { UserChangedPasswordEvent } from '../events/user-changed-password.event';
import { UserRecoveredPasswordEvent } from '../events/user-recovered-password.event';

@ApplicationService()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly passwordService: UserPasswordService,
        private readonly mailService: BaseMailService,
        private readonly templateService: BaseTemplateService,
        private readonly config: PropertyConfigService,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Creates a new user entity
     * @param input create user dto
     * @throws ValidationContainerException
     * @return user dto
     */
    async createUser(input: CreateUserInput): Promise<CreateUserOutput> {
        await ClassValidator.validate(CreateUserInput, input);

        let user = await User.create(
            input.username,
            input.password,
            input.email,
            input.firstName,
            input.lastName,
            input.isActive,
            input.isAdmin,
            input.isSuperuser,
            this.config.get(USER_PASSWORD_SALT_ROUNDS_PROPERTY),
        );

        user = await this.userRepository.save(user);

        return ClassTransformer.toClassObject(CreateUserOutput, user);
    }

    /**
     * Allows changing the user password if provided current password is correct
     * @param input change password dto
     * @throws ValidationContainerException
     * @throws ValidationException
     * @throws EventsFailedException
     */
    async changePassword(input: ChangePasswordInput): Promise<void> {
        const handler = async (queryRunner: QueryRunner) => {
            await ClassValidator.validate(ChangePasswordInput, input);

            const user = await queryRunner.manager.findOne(
                User,
                new ActiveUsersQuery({ id: input.userId }).toFindOptions(),
            );
            const saltRounds = this.config.get(USER_PASSWORD_SALT_ROUNDS_PROPERTY);

            await user.setPassword(input.newPassword, saltRounds);

            await queryRunner.manager.save(user);

            const event = new UserChangedPasswordEvent(user.id, input.token);
            await this.eventBus.publish(event);

            Logger.log(`Password has been changed for ${user.username}`);
        };

        await transaction(this.dataSource, handler);
    }

    /**
     * Allows force changing the user password
     * @param input force change password dto
     * @throws ValidationContainerException
     * @throws ValidationException
     * @throws EventsFailedException
     */
    async forceChangePassword(input: ForceChangePasswordInput): Promise<void> {
        const handler = async (queryRunner: QueryRunner) => {
            await ClassValidator.validate(ForceChangePasswordInput, input);

            const user = await queryRunner.manager.findOne(
                User,
                new ActiveUsersQuery({ username: input.username }).toFindOptions(),
            );

            await user.setPassword(
                input.newPassword,
                this.config.get(USER_PASSWORD_SALT_ROUNDS_PROPERTY),
            );
            await queryRunner.manager.save(user);

            const event = new UserChangedPasswordEvent(user.id);
            await this.eventBus.publish(event);

            Logger.log(`Password has been changed for ${user.username}`);
        };

        return transaction(this.dataSource, handler);
    }

    /**
     * Generates reset password token and sends to user email
     * @param input forgot password dto
     * @throws ValidationContainerException
     * @throws SendMailFailedException
     */
    async forgotPassword(input: ForgotPasswordInput): Promise<void> {
        await ClassValidator.validate(ForgotPasswordInput, input);

        const user = await this.userRepository.findOne(
            new ActiveUsersQuery({ email: input.email }).toFindOptions(),
        );
        const token = await this.passwordService.generateResetPasswordToken(user);

        const mailOptions = this.config.get(MAIL_PROPERTY);
        const userOptions = this.config.get(USER_PROPERTY);

        const html = await this.templateService.render(
            userOptions.password.resetMailTemplate,
            {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                host: input.host,
                protocol: input.protocol,
                token,
            },
        );

        await this.mailService.sendMail({
            subject: userOptions.password.resetMailSubject,
            to: [user.email],
            from: mailOptions.defaultFrom,
            text: '',
            html,
        });

        Logger.log(`Recover password email has been sent for ${user.username}`);
    }

    /**
     * Resets user password by reset password token
     * @param input reset password dto
     * @throws ValidationContainerException
     * @throws ValidationException
     * @throws ResetPasswordTokenInvalidException
     * @throws EventsFailedException
     */
    async resetPassword(input: ResetPasswordInput): Promise<void> {
        const handler = async (queryRunner: QueryRunner) => {
            await ClassValidator.validate(ResetPasswordInput, input);

            const user = await this.passwordService.validateResetPasswordToken(input.resetPasswordToken);

            await user.setPassword(
                input.newPassword,
                this.config.get(USER_PASSWORD_SALT_ROUNDS_PROPERTY),
            );

            await queryRunner.manager.save(user);

            const event = new UserRecoveredPasswordEvent(user.id);
            await this.eventBus.publish(event);

            Logger.log(`Password has been recovered for ${user.username}`);
        };

        return transaction(this.dataSource, handler);
    }
}
