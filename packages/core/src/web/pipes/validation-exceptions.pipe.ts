import {
    ValidationPipe,
    ValidationPipeOptions,
    BadRequestException
} from '@nestjs/common';
import { ClassValidator } from '../../utils/validation/class-validator.util';

/**
 * Extension of NestJS ValidationExceptionsPipe.
 * Throw an array of the ValidationException objects converted from
 * ValidationError objects returned by the class-validator package.
 */
export class ValidationExceptionsPipe extends ValidationPipe {
    constructor(options: ValidationPipeOptions) {
        super({
            ...options,
            exceptionFactory: errors => new BadRequestException(
                ClassValidator.toValidationExceptions(errors)
            ),
        });
    }
}
