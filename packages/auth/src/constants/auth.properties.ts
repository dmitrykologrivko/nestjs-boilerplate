import { Property } from '@nestjs-boilerplate/core';
import { AuthOptions } from '../interfaces/auth-options.interface';

export const AUTH_PROPERTY: Property<AuthOptions> = { path: 'auth' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
export const AUTH_JTW_REVOKE_AFTER_CHANGED_PASSWORD_PROPERTY: Property<string> = {
    path: 'auth.jwt.revokeAfterChangedPassword',
};
