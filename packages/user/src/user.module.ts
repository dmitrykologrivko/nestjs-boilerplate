import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import {
    ConfigModule,
    PropertyConfigService,
    SECRET_KEY_PROPERTY,
    DatabaseModule,
} from '@nestjs-boilerplate/core';
import { USER_PASSWORD_SALT_ROUNDS_PROPERTY } from './constants/user.properties';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { Permission } from './entities/permission.entity';
import { UserService } from './services/user.service';
import { UserVerificationService } from './services/user-verification.service';
import { UserPasswordService } from './services/user-password.service';
import { EmailUniqueConstraint } from './validation/email-unique.constraint';
import { EmailActiveConstraint } from './validation/email-active.constraint';
import { UsernameUniqueConstraint } from './validation/username-unique.constraint';
import { UsernameExistsConstraint } from './validation/username-exists.constraint';
import { PasswordMatchConstraint } from './validation/password-match.constraint';
import { ResetPasswordTokenValidConstraint } from './validation/reset-password-token-valid.constraint';
import { UsersCommand } from './commands/users.command';
import userConfig from './user.config';

const jwtAsyncOptions = {
    imports: [ConfigModule],
    useFactory: (config: PropertyConfigService) => {
        const moduleOptions: JwtModuleOptions = {};

        const secret = config.get(SECRET_KEY_PROPERTY);
        const expiresIn = config.get(USER_PASSWORD_SALT_ROUNDS_PROPERTY);

        if (secret) {
            moduleOptions.secret = secret;
        }
        if (expiresIn) {
            moduleOptions.signOptions = { expiresIn };
        }

        return moduleOptions;
    },
    inject: [PropertyConfigService],
};

@Module({
    imports: [
        ConfigModule.forFeature(userConfig),
        DatabaseModule.withEntities(
            [User, Group, Permission],
            { cli: __dirname + '/**/*.entity{.ts,.js}' },
        ),
        JwtModule.registerAsync(jwtAsyncOptions),
    ],
    providers: [
        UserService,
        UserVerificationService,
        UserPasswordService,
        EmailUniqueConstraint,
        EmailActiveConstraint,
        UsernameUniqueConstraint,
        UsernameExistsConstraint,
        PasswordMatchConstraint,
        ResetPasswordTokenValidConstraint,
        UsersCommand,
    ],
    exports: [
        DatabaseModule,
        UserService,
        UserVerificationService,
        UserPasswordService,
        EmailUniqueConstraint,
        EmailActiveConstraint,
        UsernameUniqueConstraint,
        UsernameExistsConstraint,
        PasswordMatchConstraint,
        ResetPasswordTokenValidConstraint,
    ],
})
export class UserModule {}
