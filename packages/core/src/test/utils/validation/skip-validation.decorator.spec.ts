import { validate, IsNotEmpty } from 'class-validator';
import { SkipValidation } from '../../../../src/utils/validation/skip-validation.decorator';

describe('SkipValidation (Integration)', () => {
    class TestDto {
        @SkipValidation()
        @IsNotEmpty()
        field!: string;
    }

    it('should skip validation for the decorated field', async () => {
        const dto = new TestDto();
        dto.field = 'testValue';

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });

    it('should skip validation even if the field is invalid', async () => {
        const dto = new TestDto();
        dto.field = '';

        const errors = await validate(dto);

        expect(errors.length).toBe(0);
    });
});
