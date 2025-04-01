import { Injectable } from '@nestjs/common';
import { validate, ValidatorOptions, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Constructor } from '../../utils/type.utils';
import { ValidationException } from './validation.exception';
import { ValidationContainerException } from './validation-container.exception';

/**
 * Class validation util
 * Wrapper on "class-validator" library
 */
@Injectable()
export class ClassValidator {

    /**
     * Validates provided object according to object`s class validation decorators
     * @param cls validatable object`s class construction function
     * @param object validatable object
     * @param validatorOptions "class-validator" library options
     * @throws ValidationContainerException
     * @return validation result
     */
    static async validate<T extends object>(
        cls: Constructor<T>,
        object: T,
        validatorOptions?: ValidatorOptions,
    ): Promise<void> {
        let validatableObject = object;

        if (!(validatableObject instanceof cls)) {
            validatableObject = plainToInstance(cls, object, { groups: validatorOptions?.groups });
        }

        const errors = await validate(validatableObject, validatorOptions);

        if (errors !== undefined && errors.length !== 0) {
            throw new ValidationContainerException(ClassValidator.toValidationExceptions(errors));
        }

        return null;
    }

    /**
     * Validates provided object according to object`s class validation decorators
     * @param cls validatable object`s class construction function
     * @param object validatable object
     * @param validatorOptions "class-validator" library options
     * @throws ValidationContainerException
     * @return validation result
     */
    async validate<T extends object>(
        cls: Constructor<T>,
        object: T,
        validatorOptions?: ValidatorOptions,
    ): Promise<void> {
        return ClassValidator.validate(cls, object, validatorOptions);
    }

    static toValidationExceptions(errors: ValidationError[]): ValidationException[] {
        return errors.map(error => new ValidationException(
            error.property,
            error.value,
            error.constraints,
            ClassValidator.toValidationExceptions(error.children),
        ));
    }
}
