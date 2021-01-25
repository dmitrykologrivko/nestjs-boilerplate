import { OneToOne, RelationOptions, ObjectType } from 'typeorm';

export function Element<T>(
    type: ObjectType<T>,
    inverseSide: string | ((object: T) => any),
    options?: RelationOptions
) {
    return OneToOne<T>(
        () => type,
        inverseSide,
        { cascade: true, eager: true, primary: true },
    );
}
