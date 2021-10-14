import { Module, DynamicModule, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import {
    ConfigModule,
    PropertyConfigService,
    SECRET_KEY_PROPERTY,
} from '@nestjs-boilerplate/core';
import { UserModule } from '@nestjs-boilerplate/user';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserJwtService } from './services/user-jwt.service';
import { BaseRevokedTokensService } from './services/base-revoked-tokens.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import authConfig from './auth.config';

export interface AuthModuleOptions<T extends BaseRevokedTokensService = BaseRevokedTokensService> {
    enableAuthJwtApi?: boolean;
    enableAuthPasswordApi?: boolean;
    passportModule?: PassportModule;
    jwtModule?: JwtModule;
    revokedTokensService?: Type<T>;
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
        UserModule,
    ],
    providers: [
        UserJwtService,
        JwtAuthService,
        JwtAuthGuard,
        IsAdminGuard,
        JwtStrategy,
    ],
    exports: [
        UserJwtService,
        JwtAuthService,
        JwtAuthGuard,
        IsAdminGuard,
    ],
})
export class AuthModule {

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const controllers = [];

        if (!options.enableAuthJwtApi || options.enableAuthJwtApi === true) {
            controllers.push(AuthJwtController);
        }

        if (!options.enableAuthPasswordApi || options.enableAuthPasswordApi === true) {
            controllers.push(AuthPasswordController);
        }

        const imports = [];

        if (options.passportModule) {
            imports.push(options.passportModule);
        } else {
            imports.push(PassportModule);
        }

        if (options.jwtModule) {
            imports.push(options.jwtModule);
        } else {
            imports.push(JwtModule.registerAsync(jwtAsyncOptions));
        }

        const revokedTokensServiceProvider = options.revokedTokensService
            ? { provide: BaseRevokedTokensService, useExisting: options.revokedTokensService }
            : { provide: BaseRevokedTokensService, useValue: null };

        return {
            module: AuthModule,
            imports,
            providers: [
                revokedTokensServiceProvider,
            ],
            controllers,
            exports: [
                revokedTokensServiceProvider.provide,
            ],
        };
    }
}
