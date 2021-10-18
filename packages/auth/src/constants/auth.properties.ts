import { Property } from '@nestjs-boilerplate/core';
import { AuthOptions } from '../interfaces/auth-options.interface';

export const AUTH_PROPERTY: Property<AuthOptions> = { path: 'auth' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
export const AUTH_JWT_REVOKE_AFTER_LOGOUT_PROPERTY: Property<boolean> = {
    path: 'auth.jwt.revokeAfterLogout',
};
export const AUTH_JWT_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY: Property<boolean> = {
    path: 'auth.jwt.revokeAfterChangedPassword',
};
