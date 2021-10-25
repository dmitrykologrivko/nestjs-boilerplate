import {
    Module,
    DynamicModule,
    Type,
} from '@nestjs/common';
import { ModuleOptions } from '@nestjs-boilerplate/core';
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
    passport?: ModuleOptions<PassportModuleOptions, PassportModuleAsyncOptions>;
    jwt?: ModuleOptions<JwtModuleOptions, JwtModuleAsyncOptions>;
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

        if (options.passport && !options.passport.type) {
            providers.push({
                provide: AUTH_PASSPORT_OPTIONS_TOKEN,
                useValue: options.passport.value,
            });
        } else if (options.passport && options.passport.type === 'async') {
            providers.push({
                ...options.passport.value,
                provide: AUTH_PASSPORT_OPTIONS_TOKEN,
            });
        } else {
            providers.push(defaultPassportOptionsProvider);
        }

        if (options.jwt && !options.jwt.type) {
            providers.push({
                provide: AUTH_JWT_OPTIONS_TOKEN,
                useValue: options.jwt.value,
            });
        } else if (options.jwt && options.jwt.type === 'async') {
            providers.push({
                ...options.jwt.value,
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
