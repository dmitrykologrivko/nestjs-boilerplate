import {plainToInstance} from 'class-transformer';
import {WriteOnly} from '../../../../src/application/dto/write-only.decorator';
import {CrudOperations} from '../../../../src/application/constants/crud-operations.enum';
import {CRUD_CREATE_UPDATE_OPERATIONS} from '../../../../src/application/constants/application.constants';

describe('WriteOnly (Integration)', () => {
    class TestDto {
        @WriteOnly()
        field!: string;
    }

    it('should expose the field for create and update operations', () => {
        const dto = new TestDto();
        dto.field = 'testValue';

        CRUD_CREATE_UPDATE_OPERATIONS.forEach(group => {
            const exposed = plainToInstance(TestDto, dto, { groups: [group] });
            expect(exposed.field).toBeDefined();
        });
    });

    it('should not expose the field for restricted groups', () => {
        const dto = new TestDto();
        dto.field = 'testValue';

        const restrictedGroups = [
            CrudOperations.READ,
            CrudOperations.DELETE,
        ];

        restrictedGroups.forEach(group => {
            const exposed = plainToInstance(TestDto, dto, { groups: [group] });
            expect(exposed.field).toBeUndefined();
        });
    });
});
