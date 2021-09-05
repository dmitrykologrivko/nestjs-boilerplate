import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { USERNAME_EXIST_CONSTRAINT } from '../constants/user.constraints';
import { UserVerificationService } from '../services/user-verification.service';

@ValidatorConstraint({ name: USERNAME_EXIST_CONSTRAINT.key, async: true })
@Injectable()
export class UsernameExistsConstraint {
    constructor(
        private readonly userVerificationService: UserVerificationService,
    ) {}

    async validate(username: string) {
        return this.userVerificationService.isUsernameExists(username);
    }

    defaultMessage(args: ValidationArguments) {
        return USERNAME_EXIST_CONSTRAINT.message;
    }
}
