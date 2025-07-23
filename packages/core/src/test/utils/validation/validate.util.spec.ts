import { Validate } from '../../../utils/validation/validate.util';
import { ValidationException } from '../../../utils/validation/validation.exception';
import { ValidationContainerException } from '../../../utils/validation/validation-container.exception';

describe('Validate', () => {
    describe('Validate', () => {
        describe('#withResults()', () => {
            it('should not throw an error if all validation results are valid', () => {
                expect(() => {
                    Validate.withResults([undefined, undefined]);
                }).not.toThrow();
            });

            it('should throw a ValidationContainerException if any validation result is invalid', () => {
                const invalidResult = new ValidationException('key', 'value', { isDefined: 'key is not defined' });
                expect(() => {
                    Validate.withResults([undefined, invalidResult]);
                }).toThrow(ValidationContainerException);
            });

            it('should include all invalid results in the ValidationContainerException', () => {
                const invalidResult1 = new ValidationException('key1', 'value1', { isDefined: 'key1 is not defined' });
                const invalidResult2 = new ValidationException('key2', 'value2', { isNotEmpty: 'key2 is empty' });

                try {
                    Validate.withResults([invalidResult1, invalidResult2]);
                } catch (error) {
                    expect(error).toBeInstanceOf(ValidationContainerException);
                    expect((error as ValidationContainerException).validationExceptions)
                        .toEqual([invalidResult1, invalidResult2]);
                }
            });
        });
    });

    describe('#withResult()', () => {
        it('should not throw an error if the validation result is valid', () => {
            expect(() => {
                Validate.withResult(undefined);
            }).not.toThrow();
        });

        it('should throw a ValidationContainerException if the validation result is invalid', () => {
            const invalidResult = new ValidationException('key', 'value', { isDefined: 'key is not defined' });
            expect(() => {
                Validate.withResult(invalidResult);
            }).toThrow(ValidationContainerException);
        });
    });

    describe('#isOptional()', () => {
        it('should skip validation for undefined value', () => {
            const result = Validate.withProperty('testKey', undefined)
                .isOptional()
                .isDefined()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should skip validation for null value', () => {
            const result = Validate.withProperty('testKey', null)
                .isOptional()
                .isDefined()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should not skip validation for non-empty value', () => {
            const result = Validate.withProperty('testKey', 'value')
                .isOptional()
                .isDefined()
                .getValidationResult();
            expect(result).toBeUndefined();
        });
    });

    describe('#isDefined()', () => {
        it('should validate a defined value', () => {
            const result = Validate.withProperty('testKey', 'value')
                .isDefined()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an undefined value', () => {
            const result = Validate.withProperty('testKey', undefined)
                .isDefined()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isDefined');
        });
    });

    describe('#isEmpty()', () => {
        it('should validate an empty value', () => {
            const result = Validate.withProperty('testKey', '')
                .isEmpty()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a non-empty value', () => {
            const result = Validate.withProperty('testKey', 'notEmpty')
                .isEmpty()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isEmpty');
        });
    });

    describe('#isNotEmpty()', () => {
        it('should validate a non-empty value', () => {
            const result = Validate.withProperty('testKey', 'notEmpty')
                .isNotEmpty()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an empty value when checking isNotEmpty', () => {
            const result = Validate.withProperty('testKey', '')
                .isNotEmpty()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isNotEmpty');
        });
    });

    describe('#equals()', () => {
        it('should validate equality', () => {
            const result = Validate.withProperty('testKey', 42)
                .equals(42)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for inequality', () => {
            const result = Validate.withProperty('testKey', 42)
                .equals(43)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('equals');
        });
    });

    describe('#notEquals()', () => {
        it('should validate inequality', () => {
            const result = Validate.withProperty('testKey', 42)
                .notEquals(43)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for equality when checking notEquals', () => {
            const result = Validate.withProperty('testKey', 42)
                .notEquals(42)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('notEquals');
        });
    });

    describe('#isIn()', () => {
        it('should validate a value in an allowed array', () => {
            const result = Validate.withProperty('testKey', 'allowed')
                .isIn(['allowed', 'other'])
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a value not in an allowed array', () => {
            const result = Validate.withProperty('testKey', 'disallowed')
                .isIn(['allowed', 'other'])
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isIn');
        });
    });

    describe('#isNotIn()', () => {
        it('should validate a value not in a disallowed array', () => {
            const result = Validate.withProperty('testKey', 'allowed')
                .isNotIn(['disallowed', 'other'])
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a value in a disallowed array', () => {
            const result = Validate.withProperty('testKey', 'disallowed')
                .isNotIn(['disallowed', 'other'])
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isNotIn');
        });
    });

    describe('#isDivisibleBy()', () => {
        it('should validate a number divisible by another', () => {
            const result = Validate.withProperty('testKey', 10)
                .isDivisibleBy(2)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a number not divisible by another', () => {
            const result = Validate.withProperty('testKey', 10)
                .isDivisibleBy(3)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isDivisibleBy');
        });
    });

    describe('#isPositiveNumber()', () => {
        it('should validate a positive number', () => {
            const result = Validate.withProperty('testKey', 42)
                .isPositiveNumber()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a non-positive number', () => {
            const result = Validate.withProperty('testKey', -1)
                .isPositiveNumber()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isPositiveNumber');
        });
    });

    describe('#isNegativeNumber()', () => {
        it('should validate a negative number', () => {
            const result = Validate.withProperty('testKey', -42)
                .isNegativeNumber()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a non-negative number', () => {
            const result = Validate.withProperty('testKey', 1)
                .isNegativeNumber()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isNegativeNumber');
        });
    });

    describe('#min()', () => {
        it('should validate a number greater than or equal to a minimum', () => {
            const result = Validate.withProperty('testKey', 10)
                .min(5)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a number less than a minimum', () => {
            const result = Validate.withProperty('testKey', 3)
                .min(5)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('min');
        });
    });

    describe('#max()', () => {
        it('should validate a number less than or equal to a maximum', () => {
            const result = Validate.withProperty('testKey', 5)
                .max(10)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a number greater than a maximum', () => {
            const result = Validate.withProperty('testKey', 15)
                .max(10)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('max');
        });
    });

    describe('#minDate()', () => {
        it('should validate a date after the specified date', () => {
            const result = Validate.withProperty('testKey', new Date('2023-10-10'))
                .minDate(new Date('2023-10-01'))
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a date before the specified date', () => {
            const result = Validate.withProperty('testKey', new Date('2023-09-30'))
                .minDate(new Date('2023-10-01'))
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('minDate');
        });
    });

    describe('#maxDate()', () => {
        it('should validate a date before the specified date', () => {
            const result = Validate.withProperty('testKey', new Date('2023-10-01'))
                .maxDate(new Date('2023-10-10'))
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a date after the specified date', () => {
            const result = Validate.withProperty('testKey', new Date('2023-10-11'))
                .maxDate(new Date('2023-10-10'))
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('maxDate');
        });
    });

    describe('#contains()', () => {
        it('should validate a string containing a seed', () => {
            const result = Validate.withProperty('testKey', 'hello world')
                .contains('world')
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string not containing a seed', () => {
            const result = Validate.withProperty('testKey', 'hello')
                .contains('world')
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('contains');
        });
    });

    describe('#notContains()', () => {
        it('should validate a string not containing a seed', () => {
            const result = Validate.withProperty('testKey', 'hello')
                .notContains('world')
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string containing a seed', () => {
            const result = Validate.withProperty('testKey', 'hello world')
                .notContains('world')
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('notContains');
        });
    });

    describe('#isAlpha()', () => {
        it('should validate a string with only letters', () => {
            const result = Validate.withProperty('testKey', 'abc')
                .isAlpha()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string with non-letter characters', () => {
            const result = Validate.withProperty('testKey', 'abc123')
                .isAlpha()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isAlpha');
        });
    });

    describe('#isAlphanumeric()', () => {
        it('should validate a string with only letters and numbers', () => {
            const result = Validate.withProperty('testKey', 'abc123')
                .isAlphanumeric()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string with special characters', () => {
            const result = Validate.withProperty('testKey', 'abc123!')
                .isAlphanumeric()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isAlphanumeric');
        });
    });

    describe('#minLength()', () => {
        it('should validate a string with a minimum length', () => {
            const result = Validate.withProperty('testKey', 'abc')
                .minLength(2)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string shorter than the minimum length', () => {
            const result = Validate.withProperty('testKey', 'a')
                .minLength(2)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('minLength');
        });
    });

    describe('#maxLength()', () => {
        it('should validate a string with a maximum length', () => {
            const result = Validate.withProperty('testKey', 'abc')
                .maxLength(5)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string longer than the maximum length', () => {
            const result = Validate.withProperty('testKey', 'abcdef')
                .maxLength(5)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('maxLength');
        });
    });

    describe('#length()', () => {
        it('should validate a string within a length range', () => {
            const result = Validate.withProperty('testKey', 'abc')
                .length(2, 5)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a string outside a length range', () => {
            const result = Validate.withProperty('testKey', 'abcdef')
                .length(2, 5)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('length');
        });
    });

    describe('#arrayContains()', () => {
        it('should validate an array containing specific values', () => {
            const result = Validate.withProperty('testKey', [1, 2, 3])
                .arrayContains([2])
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an array not containing specific values', () => {
            const result = Validate.withProperty('testKey', [1, 2, 3])
                .arrayContains([4])
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('arrayContains');
        });
    });

    describe('#arrayNotContains()', () => {
        it('should validate an array not containing specific values', () => {
            const result = Validate.withProperty('testKey', [1, 2, 3])
                .arrayNotContains([4])
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an array containing specific values', () => {
            const result = Validate.withProperty('testKey', [1, 2, 3])
                .arrayNotContains([2])
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('arrayNotContains');
        });
    });

    describe('#arrayNotEmpty()', () => {
        it('should validate a non-empty array', () => {
            const result = Validate.withProperty('testKey', [1])
                .arrayNotEmpty()
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an empty array', () => {
            const result = Validate.withProperty('testKey', [])
                .arrayNotEmpty()
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('arrayNotEmpty');
        });
    });

    describe('#arrayMinSize()', () => {
        it('should validate an array with a minimum size', () => {
            const result = Validate.withProperty('testKey', [1, 2])
                .arrayMinSize(2)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an array smaller than the minimum size', () => {
            const result = Validate.withProperty('testKey', [1])
                .arrayMinSize(2)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('arrayMinSize');
        });
    });

    describe('#arrayMaxSize()', () => {
        it('should validate an array with a maximum size', () => {
            const result = Validate.withProperty('testKey', [1, 2])
                .arrayMaxSize(2)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for an array larger than the maximum size', () => {
            const result = Validate.withProperty('testKey', [1, 2, 3])
                .arrayMaxSize(2)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('arrayMaxSize');
        });
    });

    describe('#isInstance()', () => {
        it('should validate an instance of a class', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestClass {}
            const result = Validate.withProperty('testKey', new TestClass())
                .isInstance(TestClass)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error for a value not an instance of a class', () => {
            // tslint:disable-next-line:max-classes-per-file
            class TestClass {}
            const result = Validate.withProperty('testKey', {})
                .isInstance(TestClass)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isInstance');
        });
    });

    describe('#custom()', () => {
        const validateFn =  (value) => value !== undefined && value !== null;

        it('should validate using a custom function', () => {
            const result = Validate.withProperty('testKey', 'value')
                .custom('isDefined', 'is not defined', validateFn)
                .getValidationResult();
            expect(result).toBeUndefined();
        });

        it('should throw an error when the custom function fails', () => {
            const result = Validate.withProperty('testKey', undefined)
                .custom('isDefined', 'is not defined', validateFn)
                .getValidationResult();
            expect(result).toBeInstanceOf(ValidationException);
            expect((result as ValidationException).constraints).toHaveProperty('isDefined');
        });
    });

    describe('#isValid()', () => {
        it('should return false if there is a validation exception', () => {
            const validate = Validate.withProperty('testKey', undefined).isDefined();
            expect(validate.isValid()).toBe(false);
        });

        it('should return true if there is no validation exception', () => {
            const validate = Validate.withProperty('testKey', 'value').isDefined();
            expect(validate.isValid()).toBe(true);
        });
    });
});
