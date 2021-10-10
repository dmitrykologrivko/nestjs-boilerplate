import { Module, DynamicModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import {
    ConfigModule,
    PropertyConfigService,
    SECRET_KEY_PROPERTY,
    DatabaseModule,
} from '@nestjs-boilerplate/core';
import { UserModule } from '@nestjs-boilerplate/user';
import { AUTH_JWT_EXPIRES_IN_PROPERTY } from './constants/auth.properties';
import { RevokedToken } from './entities/revoked-token.entity';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserJwtService } from './services/user-jwt.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
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
        DatabaseModule.withEntities(
            [RevokedToken],
            { cli: __dirname + '/**/*.entity{.ts,.js}' },
        ),
        UserModule.forRoot(),
        PassportModule,
        JwtModule.registerAsync(jwtAsyncOptions),
    ],
    providers: [
        UserJwtService,
        JwtAuthService,
        JwtAuthGuard,
        IsAuthenticatedGuard,
        IsAdminGuard,
        JwtStrategy,
    ],
    exports: [
        DatabaseModule,
        JwtAuthService,
        JwtAuthGuard,
        IsAuthenticatedGuard,
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

        return {
            module: AuthModule,
            controllers,
        };
    }
}
