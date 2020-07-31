import { Module, DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import {
    ConfigModule,
    PropertyConfigService,
    SECRET_KEY_PROPERTY,
    DatabaseModule,
    isUndefined,
} from '@nest-boilerplate/core';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { Permission } from './entities/permission.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { AuthService } from './services/auth.service';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserService } from './services/user.service';
import { UserVerificationService } from './services/user-verification.service';
import { UserPasswordService } from './services/user-password.service';
import { UserJwtService } from './services/user-jwt.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailUniqueConstraint } from './validation/email-unique.constraint';
import { EmailActiveConstraint } from './validation/email-active.constraint';
import { UsernameUniqueConstraint } from './validation/username-unique.constraint';
import { UsernameExistsConstraint } from './validation/username-exists.constraint';
import { PasswordMatchConstraint } from './validation/password-match.constraint';
import { ResetPasswordTokenValidConstraint } from './validation/reset-password-token-valid.constraint';
import { BindUserInterceptor } from './interceptors/bind-user.interceptor';
import { BindSelfInterceptor } from './interceptors/bind-self.interceptor';
import { UsersCommand } from './commands/users.command';
import authConfig from './auth.config';

export interface AuthModuleOptions {
    enableAuthJwtApi?: boolean;
    enableAuthPasswordApi?: boolean;
}

const jwtAsyncOptions = {
    imports: [PropertyConfigService],
    useFactory: (config: PropertyConfigService) => {
        const moduleOptions: JwtModuleOptions = {};

        const secret = config.get(SECRET_KEY_PROPERTY);
        const expiresIn = config.get(AUTH_JWT_EXPIRES_IN_PROPERTY);

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
        ConfigModule.forFeature(authConfig),
        DatabaseModule.withEntities([User, Group, Permission, RevokedToken]),
        PassportModule,
        JwtModule.registerAsync(jwtAsyncOptions),
    ],
    providers: [
        UserService,
        UserVerificationService,
        UserPasswordService,
        UserJwtService,
        AuthService,
        JwtAuthService,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        LocalStrategy,
        JwtStrategy,
        EmailUniqueConstraint,
        EmailActiveConstraint,
        UsernameUniqueConstraint,
        UsernameExistsConstraint,
        PasswordMatchConstraint,
        ResetPasswordTokenValidConstraint,
        BindUserInterceptor,
        BindSelfInterceptor,
        UsersCommand,
    ],
    exports: [
        DatabaseModule,
        UserService,
        JwtAuthService,
        LocalAuthGuard,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        BindUserInterceptor,
        BindSelfInterceptor,
    ],
})
export class AuthModule {

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const controllers = [];

        if (isUndefined(options.enableAuthJwtApi) || options.enableAuthJwtApi === true) {
            controllers.push(AuthJwtController);
        }

        if (isUndefined(options.enableAuthPasswordApi) || options.enableAuthPasswordApi === true) {
            controllers.push(AuthPasswordController);
        }

        return {
            module: AuthModule,
            controllers,
        };
    }
}
