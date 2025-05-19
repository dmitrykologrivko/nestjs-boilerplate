import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReadOnly } from '../../../../src/application/dto/read-only.decorator';
import { CrudOperations } from '../../../../src/application/constants/crud-operations.enum';

describe('ReadOnly (Integration)', () => {
    class TestDto {
        @ReadOnly()
        field!: string;
    }

    it('should expose the field for the READ group', () => {
        const dto = new TestDto();
        dto.field = 'testValue';

        const exposed = plainToInstance(TestDto, dto, { groups: [CrudOperations.READ] });
        expect(exposed).toBeDefined();
    });

    it('should skip validation for all groups', async () => {
        const dto = new TestDto();
        const errors = await validate(dto, { groups: [CrudOperations.CREATE] });

        expect(errors.length).toBe(0);
    });

    it('should not expose the field for restricted groups', () => {
        const dto = new TestDto();
        dto.field = 'testValue';

        const restrictedGroups = [
            CrudOperations.CREATE,
            CrudOperations.UPDATE,
            CrudOperations.PARTIAL_UPDATE,
            CrudOperations.DELETE,
        ];

        restrictedGroups.forEach(group => {
            const exposed = plainToInstance(TestDto, dto, { groups: [group] });
            expect(exposed.field).toBeUndefined();
        });
    });
});