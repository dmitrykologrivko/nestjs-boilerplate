import { ValidationException } from './validation.exception';

/**
 * Non field validation exception
 * Indicates invalid data across the domain
 */
export class NonFieldValidationException extends ValidationException {
    constructor(
        public constraints: { [type: string]: string; },
    ) {
        super('nonFieldErrors', null, constraints);
    }
}
