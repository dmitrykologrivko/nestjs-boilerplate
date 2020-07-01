import { Entity as TypeOrmEntity, EntityOptions as TypeOrmEntityOptions } from 'typeorm';
import { EntitySwappableService } from './entity-swappable.service';

export interface EntityOptions extends TypeOrmEntityOptions {
    swappable?: boolean;
    swap?: Function;
}

export function Entity(options: EntityOptions = {}): ClassDecorator {
    return (constructor: Function) => {
        if (options.swappable && options.swap) {
            throw new Error(`${constructor.name} cannot be swappable and have swap entity at the same time`);
        }

        if (options.swappable) {
            EntitySwappableService.allowSwappable(constructor);
        }

        if (options.swap && !options.name) {
            options.name = options.swap.name.toLowerCase();
        }

        TypeOrmEntity(options)(constructor);
    };
}
