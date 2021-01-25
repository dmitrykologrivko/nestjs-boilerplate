import {
    OneToOne,
    JoinColumn,
    ObjectType,
    RelationOptions,
    JoinColumnOptions,
} from 'typeorm';
import { applyDecorators } from '@nestjs/common';
import { BaseEntity } from './base.entity';

export function BelongsTo<T extends BaseEntity>(
    type: ObjectType<T>,
    inverseSide: string | ((object: T) => any),
    relationOptions?: RelationOptions,
    joinColumnOptions?: JoinColumnOptions,
) {
    return applyDecorators(
        OneToOne<T>(
            () => type,
            inverseSide,
            { ...relationOptions, onDelete: 'CASCADE' },
        ),
        JoinColumn(joinColumnOptions),
    );
}
