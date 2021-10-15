import {
    Module,
    DynamicModule,
    Type,
} from '@nestjs/common';
import {
    AuthModuleOptions as PassportModuleOptions,
    AuthModuleAsyncOptions as PassportModuleAsyncOptions,
} from '@nestjs/passport';
import {
    JwtModuleOptions,
    JwtModuleAsyncOptions,
} from '@nestjs/jwt';
import { PropertyConfigService, SECRET_KEY_PROPERTY } from '@nestjs-boilerplate/core';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { BaseRevokedTokensService } from './services/base-revoked-tokens.service';

export interface AuthHostModuleOptions<T extends BaseRevokedTokensService = BaseRevokedTokensService> {
    passportModuleOptions?: PassportModuleOptions;
    passportModuleAsyncOptions?: PassportModuleAsyncOptions;
    jwtModuleOptions?: JwtModuleOptions;
    jwtModuleAsyncOptions?: JwtModuleAsyncOptions;
    revokedTokensService?: Type<T>;
}

export const AUTH_PASSPORT_OPTIONS_TOKEN = 'AUTH_PASSPORT_OPTIONS_TOKEN';
export const AUTH_JWT_OPTIONS_TOKEN = 'AUTH_JWT_OPTIONS_TOKEN';

const defaultPassportOptionsProvider = {
    provide: AUTH_PASSPORT_OPTIONS_TOKEN,
    useValue: {},
};

const defaultJwtOptionsProvider = {
    provide: AUTH_JWT_OPTIONS_TOKEN,
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

@Module({})
export class AuthHostModule {

    static forRoot(options: AuthHostModuleOptions = {}): DynamicModule {
        const providers = [];

        if (options.passportModuleOptions) {
            providers.push({
                provide: AUTH_PASSPORT_OPTIONS_TOKEN,
                useValue: options.passportModuleOptions,
            });
        } else if (options.passportModuleAsyncOptions) {
            providers.push({
                ...options.passportModuleOptions,
                provide: AUTH_PASSPORT_OPTIONS_TOKEN,
            });
        } else {
            providers.push(defaultPassportOptionsProvider);
        }

        if (options.jwtModuleOptions) {
            providers.push({
                provide: AUTH_JWT_OPTIONS_TOKEN,
                useValue: options.jwtModuleOptions,
            });
        } else if (options.jwtModuleAsyncOptions) {
            providers.push({
                ...options.jwtModuleAsyncOptions,
                provide: AUTH_PASSPORT_OPTIONS_TOKEN,
            });
        } else {
            providers.push(defaultJwtOptionsProvider);
        }

        if (options.revokedTokensService) {
            providers.push({
                provide: BaseRevokedTokensService,
                useExisting: options.revokedTokensService,
            });
        } else {
            providers.push({
                provide: BaseRevokedTokensService,
                useValue: null,
            });
        }

        return {
            module: AuthHostModule,
            global: true,
            providers,
            exports: [
                AUTH_PASSPORT_OPTIONS_TOKEN,
                AUTH_JWT_OPTIONS_TOKEN,
                BaseRevokedTokensService,
            ],
        }
    }
}
