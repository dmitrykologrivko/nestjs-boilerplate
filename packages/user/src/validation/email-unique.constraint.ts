import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { EMAIL_UNIQUE_CONSTRAINT } from '../constants/user.constraints';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: EMAIL_UNIQUE_CONSTRAINT.key, async: true })
@Injectable()
export class EmailUniqueConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(email: string) {
        return this.userVerificationService.isEmailUnique(email);
    }

    defaultMessage(args: ValidationArguments) {
        return EMAIL_UNIQUE_CONSTRAINT.message;
    }
}
