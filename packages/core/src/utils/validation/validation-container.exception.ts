import { ValidationException } from './validation.exception';

/**
 * Validation result exception
 * Indicates array of validation exceptions
 */
export class ValidationContainerException {
    constructor(
        public readonly validationExceptions: ValidationException[],
    ) {}
}
