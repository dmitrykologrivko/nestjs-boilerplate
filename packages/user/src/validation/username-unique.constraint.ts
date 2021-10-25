import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { USERNAME_UNIQUE_CONSTRAINT } from '../constants/user.constraints';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: USERNAME_UNIQUE_CONSTRAINT.key, async: true })
@Injectable()
export class UsernameUniqueConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(username: string) {
        return this.userVerificationService.isUsernameUnique(username);
    }

    defaultMessage(args: ValidationArguments) {
        return USERNAME_UNIQUE_CONSTRAINT.message;
    }
}
