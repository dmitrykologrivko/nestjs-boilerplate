import { Property } from '@nestjs-boilerplate/core';
import { AuthOptions } from '../interfaces/auth-options.interface';

export const AUTH_PROPERTY: Property<AuthOptions> = { path: 'auth' };
export const AUTH_JWT_EXPIRES_IN_PROPERTY: Property<string> = { path: 'auth.jwt.expiresIn' };
