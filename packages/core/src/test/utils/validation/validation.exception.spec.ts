import { ValidationException } from '../../../utils/validation/validation.exception';

describe('ValidationException', () => {
    describe('#toString()', () => {
        it('should create an instance with the correct properties', () => {
            const exception = new ValidationException(
                'testProperty',
                'testValue',
                { isString: 'Value must be a string' },
                []
            );

            expect(exception.property).toBe('testProperty');
            expect(exception.value).toBe('testValue');
            expect(exception.constraints).toEqual({ isString: 'Value must be a string' });
            expect(exception.children).toEqual([]);
        });

        it('should format a message correctly when constraints are present', () => {
            const exception = new ValidationException(
                'testProperty',
                'testValue',
                { isString: 'Value must be a string', isRequired: 'Value is required' }
            );

            const result = exception.toString();
            expect(result).toContain('"testProperty" has invalid constraints:');
            expect(result).toContain('- Value must be a string');
            expect(result).toContain('- Value is required');
        });

        it('should handle nested children exceptions correctly', () => {
            const childException = new ValidationException(
                'childProperty',
                'childValue',
                { isNumber: 'Value must be a number' }
            );

            const parentException = new ValidationException(
                'parentProperty',
                'parentValue',
                { isString: 'Value must be a string' },
                [childException]
            );

            const result = parentException.toString();
            expect(result).toContain('"parentProperty" has invalid constraints:');
            expect(result).toContain('- Value must be a string');
            expect(result).toContain('"parentProperty.childProperty" has invalid constraints:');
            expect(result).toContain('- Value must be a number');
        });

        it('should return an empty string if no constraints are present', () => {
            const exception = new ValidationException('testProperty', 'testValue', null);
            const result = exception.toString();
            expect(result).toBe('');
        });
    });
});