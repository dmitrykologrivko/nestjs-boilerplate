import { OneToOne, ObjectType } from 'typeorm';

export function Segregated<T>(type: (type?: any) => ObjectType<T>) {
    return OneToOne<T>(type, '_parent', { cascade: true, eager: true });
}
