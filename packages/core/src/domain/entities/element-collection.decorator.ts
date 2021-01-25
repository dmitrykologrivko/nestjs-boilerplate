import { OneToMany, RelationOptions, ObjectType } from 'typeorm';
import { BaseValueObject } from './base.value-object';

export function ElementCollection<T extends BaseValueObject>(
    type: ObjectType<T>,
    inverseSide: string | ((object: T) => any),
    options?: RelationOptions
) {
    return OneToMany(
        () => type,
        inverseSide,
        { ...options, cascade: true, eager: true, primary: true },
    );
}
