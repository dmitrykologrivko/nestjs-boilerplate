import { Module, DynamicModule, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PropertyConfigService, SECRET_KEY_PROPERTY } from '@nestjs-boilerplate/core';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { BaseRevokedTokensService } from './services/base-revoked-tokens.service';

export interface AuthHostModuleOptions<T extends BaseRevokedTokensService = BaseRevokedTokensService> {
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

@Module({})
export class AuthHostModule {

    static forRoot(options: AuthHostModuleOptions = {}): DynamicModule {
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
            module: AuthHostModule,
            imports,
            global: true,
            providers: [revokedTokensServiceProvider],
            exports: [
                JwtModule,
                PassportModule,
                revokedTokensServiceProvider.provide,
            ],
        }
    }
}
