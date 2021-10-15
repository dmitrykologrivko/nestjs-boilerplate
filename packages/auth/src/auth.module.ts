import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs-boilerplate/core';
import { UserModule } from '@nestjs-boilerplate/user';
import { JwtAuthService } from './services/jwt-auth.service';
import { UserJwtService } from './services/user-jwt.service';
import { BaseRevokedTokensService } from './services/base-revoked-tokens.service';
import { AuthJwtController } from './controllers/auth-jwt.controller';
import { AuthPasswordController } from './controllers/auth-password.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthHostModule, AuthHostModuleOptions } from './auth-host.module';
import authConfig from './auth.config';

export interface AuthModuleOptions<T extends BaseRevokedTokensService = BaseRevokedTokensService> extends AuthHostModuleOptions<T> {
    enableAuthJwtApi?: boolean;
    enableAuthPasswordApi?: boolean;
}

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

        return {
            module: AuthModule,
            imports: [AuthHostModule.forRoot(options)],
            controllers,
        };
    }
}
