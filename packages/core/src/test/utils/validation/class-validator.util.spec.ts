import { IsString, IsNotEmpty } from 'class-validator';
import { ClassValidator } from '../../../../src/utils/validation/class-validator.util';
import { ValidationContainerException } from '../../../../src/utils/validation/validation-container.exception';

describe('ClassValidator', () => {
    class TestClass {
        @IsString()
        @IsNotEmpty()
        name!: string;
    }

    let classValidator: ClassValidator;

    beforeEach(() => {
        classValidator = new ClassValidator();
    });

    describe('#validate()', () => {
        it('(static) should validate a valid plain object successfully', async () => {
            const validObject = { name: 'Valid Name' };

            await expect(
                ClassValidator.validate(TestClass, validObject)
            ).resolves.toBeNull();
        });

        it('(instance) should validate a valid plain object successfully', async () => {
            const validObject = { name: 'Valid Name' };

            await expect(
                classValidator.validate(TestClass, validObject)
            ).resolves.toBeNull();
        });

        it('(static) should validate a class instance successfully', async () => {
            const validObject = new TestClass();
            validObject.name = 'Valid Name';

            await expect(
                ClassValidator.validate(TestClass, validObject)
            ).resolves.toBeNull();
        });

        it('(instance) should validate a class instance successfully', async () => {
            const validObject = new TestClass();
            validObject.name = 'Valid Name';

            await expect(
                classValidator.validate(TestClass, validObject)
            ).resolves.toBeNull();
        });

        it('(static) should throw an error for an invalid object', async () => {
            const invalidObject = { name: '' };

            try {
                await ClassValidator.validate(TestClass, invalidObject);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationContainerException);
                const validationErrors = (error as ValidationContainerException).validationExceptions;
                expect(validationErrors).toHaveLength(1);
                expect(validationErrors[0].property).toBe('name');
                expect(validationErrors[0].constraints).toHaveProperty('isNotEmpty');
            }
        });

        it('(instance) should throw an error for an invalid object', async () => {
            const invalidObject = { name: '' };

            try {
                await classValidator.validate(TestClass, invalidObject);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationContainerException);
                const validationErrors = (error as ValidationContainerException).validationExceptions;
                expect(validationErrors).toHaveLength(1);
                expect(validationErrors[0].property).toBe('name');
                expect(validationErrors[0].constraints).toHaveProperty('isNotEmpty');
            }
        });
    });
});
