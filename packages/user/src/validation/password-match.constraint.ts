import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidationArguments } from 'class-validator';
import { PASSWORD_MATCH_CONSTRAINT } from '../constants/user.constraints';
import { UserPasswordService } from '../services/user-password.service';

const USER_ID_PROPERTY = 'userId';

@ValidatorConstraint({ name: PASSWORD_MATCH_CONSTRAINT.key, async: true })
@Injectable()
export class PasswordMatchConstraint {
    constructor(
        private readonly userPasswordService: UserPasswordService,
    ) {}

    async validate(password: string, args: ValidationArguments) {
        if (!password || !args.object.hasOwnProperty(USER_ID_PROPERTY)) {
            return false;
        }

        return this.userPasswordService.comparePassword(args.object[USER_ID_PROPERTY], password);
    }

    defaultMessage(args: ValidationArguments) {
        return PASSWORD_MATCH_CONSTRAINT.message;
    }
}
