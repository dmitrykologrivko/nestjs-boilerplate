import { Property } from '@nestjs-boilerplate/core';
import { UserOptions } from '../interfaces/user-options.interface';

export const USER_PROPERTY: Property<UserOptions> = { path: 'user' };
export const USER_PASSWORD_SALT_ROUNDS_PROPERTY: Property<number> = { path: 'user.password.saltRounds' };
export const USER_PASSWORD_RESET_TIMEOUT_PROPERTY: Property<string> = { path: 'user.password.resetTimeout' };
export const USER_PASSWORD_RESET_MAIL_SUBJECT_PROPERTY: Property<string> = { path: 'user.password.resetMailSubject' };
export const USER_PASSWORD_RESET_MAIL_TEMPLATE_PROPERTY: Property<string> = { path: 'user.password.resetMailTemplate' };
