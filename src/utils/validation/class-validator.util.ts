import { Injectable } from '@nestjs/common';
import { validate, ValidationOptions, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { Result, Ok, Err } from '@usefultools/monads';
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
     * @param validationOptions "class-validator" library options
     * @return validation result
     */
    static async validate<T extends object>(
        cls: ClassType<T>,
        object: T,
        validationOptions?: ValidationOptions,
    ): Promise<Result<void, ValidationContainerException>> {
        let validatableObject = object;

        if (!(validatableObject instanceof cls)) {
            validatableObject = plainToClass(cls, object, validationOptions);
        }

        const errors = await validate(validatableObject, validationOptions);

        if (errors !== undefined && errors.length !== 0) {
            return Err(
                new ValidationContainerException(ClassValidator.toValidationExceptions(errors)),
            );
        }

        return Ok(null);
    }

    /**
     * Validates provided object according to object`s class validation decorators
     * @param cls validatable object`s class construction function
     * @param object validatable object
     * @param validationOptions "class-validator" library options
     * @return validation result
     */
    async validate<T extends object>(
        cls: ClassType<T>,
        object: T,
        validationOptions?: ValidationOptions,
    ): Promise<Result<void, ValidationContainerException>> {
        return ClassValidator.validate(cls, object, validationOptions);
    }

    private static toValidationExceptions(errors: ValidationError[]): ValidationException[] {
        return errors.map(error => new ValidationException(
            error.property,
            error.value,
            error.constraints,
            ClassValidator.toValidationExceptions(error.children),
        ));
    }
}
