import { Property } from '@nest-boilerplate/core';

export const AUTH_PASSWORD_SALT_ROUNDS_PROPERTY: Property<number> = { path: 'auth.password.saltRounds' };
export const AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY: Property<string> = { path: 'auth.password.resetTimeout' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
