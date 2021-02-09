import { OneToMany, ObjectType } from 'typeorm';

export function ElementCollection<T>(type: (type?: any) => ObjectType<T>) {
    return OneToMany(type, '_parent', { cascade: true, eager: true });
}
