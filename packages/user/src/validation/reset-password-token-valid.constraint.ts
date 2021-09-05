import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { RESET_PASSWORD_TOKEN_VALID_CONSTRAINT } from '../constants/user.constraints';
import { UserPasswordService } from '../services/user-password.service';

@ValidatorConstraint({ name: RESET_PASSWORD_TOKEN_VALID_CONSTRAINT.key, async: true })
@Injectable()
export class ResetPasswordTokenValidConstraint {
    constructor(
        private readonly userPasswordService: UserPasswordService,
    ) {}

    async validate(token: string) {
        return await this.userPasswordService.isResetPasswordTokenValid(token);
    }

    defaultMessage(args: ValidationArguments) {
        return RESET_PASSWORD_TOKEN_VALID_CONSTRAINT.message;
    }
}
