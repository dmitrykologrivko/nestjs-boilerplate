import { ValidationException } from './validation.exception';

/**
 * Validation result exception
 * Indicates array of validation exceptions
 */
export class ValidationContainerException extends Error {
    constructor(
        public readonly validationExceptions: ValidationException[],
    ) {
        super();
    }
}
