import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { EMAIL_ACTIVE_CONSTRAINT } from '../constants/user.constraints';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: EMAIL_ACTIVE_CONSTRAINT.key, async: true })
@Injectable()
export class EmailActiveConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(email: string) {
        return await this.userVerificationService.isEmailActive(email);
    }

    defaultMessage(args: ValidationArguments) {
        return EMAIL_ACTIVE_CONSTRAINT.message;
    }
}
