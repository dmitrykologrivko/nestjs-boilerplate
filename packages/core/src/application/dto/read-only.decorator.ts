import { applyDecorators } from '@nestjs/common';
import { Expose, ExposeOptions } from 'class-transformer';
import { CrudOperations } from '../constants/crud-operations.enum';
import { SkipValidation } from '../../utils/validation/skip-validation.decorator';

export function ReadOnly(options?: ExposeOptions) {
    const restrictedOperations = [
        CrudOperations.CREATE.toString(),
        CrudOperations.UPDATE.toString(),
        CrudOperations.PARTIAL_UPDATE.toString(),
        CrudOperations.DELETE.toString(),
    ];

    const groups = [
        ...options?.groups || [],
        CrudOperations.READ,
    ].filter(group => !restrictedOperations.includes(group))

    return applyDecorators(
        SkipValidation({ always: true }),
        Expose({ ...options, groups }),
    );
}
