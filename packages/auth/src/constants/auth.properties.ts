import { Property } from '@nestjs-boilerplate/core';
import { AuthOptions } from '../interfaces/auth-options.interface';

export const AUTH_PROPERTY: Property<AuthOptions> = { path: 'auth' };
export const AUTH_PASSWORD_SALT_ROUNDS_PROPERTY: Property<number> = { path: 'auth.password.saltRounds' };
export const AUTH_PASSWORD_RESET_TIMEOUT_PROPERTY: Property<string> = { path: 'auth.password.resetTimeout' };
export const AUTH_PASSWORD_RESET_MAIL_SUBJECT_PROPERTY: Property<string> = { path: 'auth.password.resetMailSubject' };
export const AUTH_PASSWORD_RESET_MAIL_TEMPLATE_PROPERTY: Property<string> = { path: 'auth.password.resetMailTemplate' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
