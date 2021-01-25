import { Entity, EntityOptions, PrimaryGeneratedColumn } from 'typeorm';

export interface ValueObjectOptions extends EntityOptions {
    segregated: boolean;
}

export function ValueObject(options?: ValueObjectOptions): ClassDecorator {
    return (constructor: Function) => {
        if (options?.segregated) {
            Object.defineProperty(
                constructor.prototype,
                '_id',
                {
                    configurable: true,
                    writable: true,
                }
            )

            PrimaryGeneratedColumn({ name: 'id' })(constructor.prototype, '_id');

            Entity(options)(constructor);
        }
    }
}
