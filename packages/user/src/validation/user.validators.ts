import {
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
    USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    FIRST_NAME_MAX_LENGTH,
    LAST_NAME_MAX_LENGTH,
} from '../entities/user.entity';

export function ValidateUsername() {
    return applyDecorators(
        IsNotEmpty(),
        MaxLength(USERNAME_MAX_LENGTH),
    );
}

export function ValidatePassword() {
    return applyDecorators(
        IsNotEmpty(),
        MinLength(PASSWORD_MIN_LENGTH),
        MaxLength(PASSWORD_MAX_LENGTH),
    );
}

export function ValidateEmail() {
    return applyDecorators(
        IsEmail(),
        MaxLength(EMAIL_MAX_LENGTH),
    );
}

export function ValidateFirstName() {
    return applyDecorators(
        IsNotEmpty(),
        MaxLength(FIRST_NAME_MAX_LENGTH),
    );
}

export function ValidateLastName() {
    return applyDecorators(
        IsNotEmpty(),
        MaxLength(LAST_NAME_MAX_LENGTH),
    );
}
