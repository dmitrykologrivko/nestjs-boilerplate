import { Entity, EntityOptions, PrimaryGeneratedColumn } from 'typeorm';

export interface ValueObjectOptions extends EntityOptions {
    separatable: boolean;
}

export function ValueObject(options?: ValueObjectOptions): ClassDecorator {
    return (constructor: Function) => {
        if (options?.separatable) {
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
