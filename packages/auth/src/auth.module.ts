import { Module, DynamicModule, OnModuleInit } from '@nestjs/common';
import { PassportModule, AuthModuleOptions as PassportModuleOptions } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, EventBus } from '@nestjs-boilerplate/core';
import { UserModule } from '@nestjs-boilerplate/user';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserJwtService } from './services/user-jwt.service';
import { BaseRevokedTokensService } from './services/base-revoked-tokens.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserChangedPasswordEventHandler } from './events/user-changed-password-event.handler';
import {
    AuthHostModule,
    AuthHostModuleOptions,
    AUTH_PASSPORT_OPTIONS_TOKEN,
    AUTH_JWT_OPTIONS_TOKEN,
} from './auth-host.module';
import authConfig from './auth.config';

export interface AuthModuleOptions<T extends BaseRevokedTokensService = BaseRevokedTokensService> extends AuthHostModuleOptions<T> {
    enableAuthJwtApi?: boolean;
    enableAuthPasswordApi?: boolean;
}

@Module({
    imports: [
        PassportModule.registerAsync({
            useFactory: (options: PassportModuleOptions) => {
                return options;
            },
            inject: [AUTH_PASSPORT_OPTIONS_TOKEN],
        }),
        JwtModule.registerAsync({
            useFactory: (options: JwtModuleOptions) => {
                return options;
            },
            inject: [AUTH_JWT_OPTIONS_TOKEN],
        }),
        ConfigModule.forFeature(authConfig),
        UserModule,
    ],
    providers: [
        UserJwtService,
        JwtAuthService,
        JwtAuthGuard,
        IsAdminGuard,
        JwtStrategy,
        UserChangedPasswordEventHandler,
    ],
    exports: [
        UserJwtService,
        JwtAuthService,
        JwtAuthGuard,
        IsAdminGuard,
    ],
})
export class AuthModule implements OnModuleInit {
    constructor(
        private eventBus: EventBus,
        private userChangedPasswordEventHandler: UserChangedPasswordEventHandler,
    ) {}

    onModuleInit(): any {
        this.eventBus.registerHandler(this.userChangedPasswordEventHandler);
    }

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const controllers = [];

        if (!options.enableAuthJwtApi || options.enableAuthJwtApi === true) {
            controllers.push(AuthJwtController);
        }

        if (!options.enableAuthPasswordApi || options.enableAuthPasswordApi === true) {
            controllers.push(AuthPasswordController);
        }

        return {
            module: AuthModule,
            imports: [AuthHostModule.forRoot(options)],
            controllers,
        };
    }
}
