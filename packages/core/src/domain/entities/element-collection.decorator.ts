import { OneToMany, RelationOptions, ObjectType } from 'typeorm';

export function ElementCollection<T>(
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
