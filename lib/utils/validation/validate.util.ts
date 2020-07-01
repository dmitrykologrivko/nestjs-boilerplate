import { Result, Ok, Err } from '@usefultools/monads';
import { Validator } from 'class-validator';
import { ValidationException } from './validation.exception';
import { ValidationContainerException } from './validation-container.exception';

export type ValidationResult = Result<void, ValidationException>;
export type ValidationContainerResult = Result<void, ValidationContainerException>;

/**
 * Validation util for single properties
 * Wrapper on "class-validator" library
 */
export class Validate {
    private static validator = new Validator();

    private exception: ValidationException;

    private constructor(
        private readonly key: string,
        private readonly value: unknown,
    ) {}

    /**
     * Returns validator of "class-validator" library
     * @return "class-validator" library validator
     */
    static getValidator() {
        return this.validator;
    }

    /**
     * Start point to construct validation chain
     * @param key property key
     * @param value property value
     * @return Validate instance
     */
    static withProperty(key: string, value: unknown): Validate {
        return new Validate(key, value);
    }

    /**
     * Merges separated validation results into single validation result
     * Can be used for bulk validation
     * @param results array of separated validation results
     * @return single validation result
     */
    static withResults(results: ValidationResult[]): ValidationContainerResult {
        const errorResults = results.filter(result => result.is_err());

        if (errorResults.length > 0) {
            return Err(
                new ValidationContainerException(errorResults.map(result => result.unwrap_err())),
            );
        }

        return Ok(null);
    }

    /**
     * Checks if value is not empty
     * @return Validate instance
     */
    isNotEmpty(): Validate {
        if (!Validate.getValidator().isNotEmpty(this.value)) {
            this.rejectValidation('isNotEmpty', `${this.key} is empty`);
        }
        return this;
    }

    /**
     * Checks if value is email
     * @return Validate instance
     */
    isEmail(): Validate {
        if (!Validate.getValidator().isEmail(this.value)) {
            this.rejectValidation('isEmail', `${this.key} is not email`);
        }
        return this;
    }

    /**
     * Checks if value is not shorter than min length
     * @param min min length
     * @return Validate instance
     */
    minLength(min: number): Validate {
        if (!Validate.getValidator().minLength(this.value, min)) {
            this.rejectValidation('minLength', `${this.key} is short than min length`);
        }
        return this;
    }

    /**
     * Checks if value is not exceed max length
     * @param max max length
     * @return Validate instance
     */
    maxLength(max: number): Validate {
        if (!Validate.getValidator().maxLength(this.value, max)) {
            this.rejectValidation('maxLength', `${this.key} exceeded max length`);
        }
        return this;
    }

    /**
     * Returns validation result
     * @return validation result
     */
    isValid(): ValidationResult {
        if (this.exception) {
            return Err(this.exception);
        }
        return Ok(null);
    }

    private rejectValidation(constraint: string, message: string) {
        if (!this.exception) {
            this.exception = new ValidationException(
                this.key,
                this.value,
                {[constraint]: message},
            );
        } else {
            this.exception.constraints[constraint] = message;
        }
    }
}
