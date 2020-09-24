import {
    ValidationPipe as NestValidationPipe,
    ValidationPipeOptions,
    BadRequestException
} from '@nestjs/common';
import { ClassValidator } from './class-validator.util';

/**
 * Extension of NestJS ValidationPipe.
 * Throw an array of the ValidationException objects converted from
 * ValidationError objects returned by the class-validator package.
 */
export class ValidationPipe extends NestValidationPipe {
    constructor(options: ValidationPipeOptions) {
        super({
            ...options,
            exceptionFactory: errors => new BadRequestException(
                ClassValidator.toValidationExceptions(errors)
            ),
        });
    }
}
