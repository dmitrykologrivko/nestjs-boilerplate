import {
    isDefined,
    isEmpty,
    isNotEmpty,
    equals,
    notEquals,
    isIn,
    isNotIn,
    isDivisibleBy,
    isPositive,
    isNegative,
    min,
    max,
    minDate,
    maxDate,
    contains,
    notContains,
    isAlpha,
    isAlphanumeric,
    minLength,
    maxLength,
    length,
    arrayContains,
    arrayNotContains,
    arrayNotEmpty,
    arrayMinSize,
    arrayMaxSize,
    isInstance,
} from 'class-validator';
import { ValidationException } from './validation.exception';
import { ValidationContainerException } from './validation-container.exception';

export type ValidationResult = void | ValidationException;

/**
 * Validation util for single properties
 * Wrapper on "class-validator" library for commonly used validators
 */
export class Validate {

    private exception: ValidationException;
    private optional: boolean = false;

    private constructor(
        private readonly key: string,
        private readonly value: unknown,
    ) {}

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
     * Asserts if validation results are ok else throws ValidationContainerException
     * @param results array of separated validation results
     * @throws ValidationContainerException
     */
    static withResults(results: ValidationResult[]): void {
        const errorResults = results.filter(result => result instanceof ValidationException);
        if (errorResults.length > 0) {
            throw new ValidationContainerException(errorResults as ValidationException[]);
        }
    }

    /**
     * Asserts if validation result is ok else throws ValidationContainerException
     * @param result result of validation
     * @throws ValidationContainerException
     */
    static withResult(result: ValidationResult): void {
        return Validate.withResults([result]);
    }

    /**
     * Should skip validation rules if the value is empty (=== null, === undefined)
     */
    isOptional(): Validate {
        this.optional = true;
        return this;
    }

    /**
     * Checks if the value is defined (!== undefined, !== null)
     */
    isDefined(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isDefined(this.value)) {
            this.rejectValidation('isDefined', `${this.key} is not defined`);
        }

        return this;
    }

    /**
     * Checks if the value is empty (=== '', === null, === undefined)
     */
    isEmpty(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isEmpty(this.value)) {
            this.rejectValidation('isEmpty', `${this.key} is not empty`);
        }

        return this;
    }

    /**
     * Checks if the value is not empty (!== '', !== null, !== undefined)
     */
    isNotEmpty(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isNotEmpty(this.value)) {
            this.rejectValidation('isNotEmpty', `${this.key} is empty`);
        }

        return this;
    }

    /**
     * Checks if the value matches the comparison (===)
     */
    equals(comparison: unknown): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!equals(this.value, comparison)) {
            this.rejectValidation('equals', `${this.key} not matches the comparison`);
        }

        return this;
    }

    /**
     * Checks if the value not matches the comparison (!==)
     */
    notEquals(comparison: unknown): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!notEquals(this.value, comparison)) {
            this.rejectValidation('notEquals', `${this.key} matches the comparison`);
        }

        return this;
    }

    /**
     * Checks if the value is in the array of allowed values
     */
    isIn(values: any[]): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isIn(this.value, values)) {
            this.rejectValidation('isIn', `${this.key} is not the array of allowed values`);
        }

        return this;
    }

    /**
     * Checks if the value is not in the array of disallowed values
     */
    isNotIn(values: any[]): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isNotIn(this.value, values)) {
            this.rejectValidation('isNotIn', `${this.key} is the array of disallowed values`);
        }

        return this;
    }

    /**
     * Checks if the value is a number that's divisible by another
     */
    isDivisibleBy(num: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isDivisibleBy(this.value, num)) {
            this.rejectValidation(
                'isDivisibleBy',
                `${this.key} is not divisible by provided number`,
            );
        }

        return this;
    }

    /**
     * Checks if the value is a positive number
     */
    isPositiveNumber(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isPositive(this.value)) {
            this.rejectValidation('isPositiveNumber', `${this.key} is not positive number`);
        }

        return this;
    }

    /**
     * Checks if the value is a negative number
     */
    isNegativeNumber(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isNegative(this.value)) {
            this.rejectValidation('isNegativeNumber', `${this.key} is not negative number`);
        }

        return this;
    }

    /**
     * Checks if the given number is greater than or equal to given number
     */
    min(_min: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!min(this.value, _min)) {
            this.rejectValidation('min', `${this.key} is not greater nor equal to given number`);
        }

        return this;
    }

    /**
     * Checks if the given number is less than or equal to given number
     */
    max(_max: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!max(this.value, _max)) {
            this.rejectValidation('max', `${this.key} is not less nor equal to given number`);
        }

        return this;
    }

    /**
     * Checks if the value is a date that's after the specified date
     */
    minDate(date: Date): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!minDate(this.value, date)) {
            this.rejectValidation(
                'minDate',
                `${this.key} is not is a date that's after the specified date`,
            );
        }

        return this;
    }

    /**
     * Checks if the value is a date that's before the specified date
     */
    maxDate(date: Date): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!maxDate(this.value, date)) {
            this.rejectValidation(
                'maxDate',
                `${this.key} is not a date that's before the specified date`,
            );
        }

        return this;
    }

    /**
     * Checks if the string contains the seed
     */
    contains(seed: string): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!contains(this.value, seed)) {
            this.rejectValidation('contains', `${this.key} not contains the seed`);
        }

        return this;
    }

    /**
     * Checks if the string not contains the seed
     */
    notContains(seed: string): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!notContains(this.value, seed)) {
            this.rejectValidation('notContains', `${this.key} contains the seed`);
        }

        return this;
    }

    /**
     * Checks if the string contains only letters (a-zA-Z)
     */
    isAlpha(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isAlpha(this.value)) {
            this.rejectValidation('isAlpha', `${this.key} contains not only letters`);
        }

        return this;
    }

    /**
     * Checks if the string contains only letters and numbers
     */
    isAlphanumeric(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isAlphanumeric(this.value)) {
            this.rejectValidation(
                'isAlphanumeric',
                `${this.key} contains not only letters and numbers`,
            );
        }

        return this;
    }

    /**
     * Checks if the value is not shorter than min length
     */
    minLength(_min: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!minLength(this.value, _min)) {
            this.rejectValidation('minLength', `${this.key} is shorter than min length`);
        }

        return this;
    }

    /**
     * Checks if the value is not exceed max length
     */
    maxLength(_max: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!maxLength(this.value, _max)) {
            this.rejectValidation('maxLength', `${this.key} exceeded max length`);
        }

        return this;
    }

    /**
     * Checks if the value is exceed length range
     */
    length(_min: number, _max: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!length(this.value, _min, _max)) {
            this.rejectValidation('length', `${this.key} exceeded length range`);
        }

        return this;
    }

    /**
     * Checks if array contains all values from the given array of values
     */
    arrayContains(values: any[]): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!arrayContains(this.value, values)) {
            this.rejectValidation(
                'arrayContains',
                `${this.key} not contains values from the given array of values`,
            );
        }

        return this;
    }

    /**
     * Checks if array does not contain any of the given values
     */
    arrayNotContains(values: any[]): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!arrayNotContains(this.value, values)) {
            this.rejectValidation(
                'arrayNotContains',
                `${this.key} contains at least one value from given array of values`,
            );
        }

        return this;
    }

    /**
     * Checks if given array is not empty
     */
    arrayNotEmpty(): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!arrayNotEmpty(this.value)) {
            this.rejectValidation('arrayNotEmpty', `${this.key} is an empty array`);
        }

        return this;
    }

    /**
     * Checks if the array's length is greater than or equal to the specified number
     */
    arrayMinSize(_min: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!arrayMinSize(this.value, _min)) {
            this.rejectValidation(
                'arrayMinSize',
                `${this.key} is array with length which not greater than nor equal to the specified number`,
            );
        }

        return this;
    }

    /**
     * Checks if the array's length is less or equal to the specified number
     */
    arrayMaxSize(_max: number): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!arrayMaxSize(this.value, _max)) {
            this.rejectValidation(
                'arrayMaxSize',
                `${this.key} is array with length which not less nor equal to the specified number`,
            );
        }

        return this;
    }

    /**
     * Checks if the property is an instance of the passed value
     */
    isInstance(value: any): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!isInstance(this.value, value)) {
            this.rejectValidation(
                'isInstance',
                `${this.key} is not an instance of the passed value`,
            );
        }

        return this;
    }

    /**
     * Allows to execute custom validation function
     * @param constraint name of validation constraint
     * @param message validation error message
     * @param fn validation function
     */
    custom(constraint: string, message: string, fn: (value: unknown) => boolean): Validate {
        if (this.shouldSkip()) {
            return this;
        }

        if (!fn(this.value)) {
            this.rejectValidation(constraint, `${this.key} ${message}`);
        }

        return this;
    }

    /**
     * If validation is ok, returns undefined, else returns ValidationException
     */
    getValidationResult(): ValidationResult {
        if (this.exception) {
            return this.exception;
        }
    }

    /**
     * If validation is ok, returns true, else return false accordingly
     */
    isValid(): boolean {
        return !this.exception;
    }

    private shouldSkip() {
        return this.optional && !this.value;
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
