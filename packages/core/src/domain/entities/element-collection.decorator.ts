import { OneToMany, RelationOptions } from 'typeorm';

export function ElementCollection<T>(
    type: Function,
    inverseSide: string | ((object: T) => any),
    options?: RelationOptions
) {
    return OneToMany(() => type, inverseSide, { ...options, cascade: true, onDelete: 'CASCADE', primary: true })
}
