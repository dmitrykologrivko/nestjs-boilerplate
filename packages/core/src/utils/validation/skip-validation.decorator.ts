import { ValidateIf, ValidationOptions } from 'class-validator';

export function SkipValidation(options?: ValidationOptions) {
    return ValidateIf(() => false, options);
}
