import { validate, IsNotEmpty } from 'class-validator';
import { PartialUpdate } from '../../../../src/application/dto/partial-update.decorator';
import { CrudOperations } from '../../../../src/application/constants/crud-operations.enum';

describe('PartialUpdate (Integration)', () => {
    class TestDto {
        @PartialUpdate()
        @IsNotEmpty()
        field!: string;
    }

    it('should validate the field as optional for the PARTIAL_UPDATE group', async () => {
        const dto = new TestDto();
        const errors = await validate(dto, { groups: [CrudOperations.PARTIAL_UPDATE] });

        expect(errors.length).toBe(0);
    });

    it('should not validate the field as optional for other groups', async () => {
        const dto = new TestDto();
        const errors = await validate(dto, { groups: ['OTHER_GROUP'] });

        expect(errors.length).toBeGreaterThan(0);
    });
});
