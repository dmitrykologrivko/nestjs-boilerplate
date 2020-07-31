import { Validate } from 'class-validator';
import {
    ValidateUsername,
    ValidatePassword,
    ValidateEmail,
    ValidateFirstName,
    ValidateLastName,
} from '../validation/user.validators';
import { UsernameUniqueConstraint } from '../validation/username-unique.constraint';
import { EmailUniqueConstraint } from '../validation/email-unique.constraint';

export class CreateUserInput {

    @ValidateUsername()
    @Validate(UsernameUniqueConstraint)
    username: string;

    @ValidatePassword()
    password: string;

    @ValidateEmail()
    @Validate(EmailUniqueConstraint)
    email: string;

    @ValidateFirstName()
    firstName: string;

    @ValidateLastName()
    lastName: string;

    isActive?: boolean;
    isAdmin?: boolean;
    isSuperuser?: boolean;
}
