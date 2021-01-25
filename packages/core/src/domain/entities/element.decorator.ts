import { OneToOne, RelationOptions, ObjectType } from 'typeorm';
import { BaseValueObject } from './base.value-object';

export function Element<T extends BaseValueObject>(
    type: ObjectType<T>,
    inverseSide: string | ((object: T) => any),
    options?: RelationOptions,
) {
    return OneToOne<T>(
        () => type,
        inverseSide,
        { ...options, cascade: true, eager: true, primary: true },
    );
}
