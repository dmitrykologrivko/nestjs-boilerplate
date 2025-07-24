import { Entity as TypeOrmEntity, EntityOptions as TypeOrmEntityOptions } from 'typeorm';
import { TFunction } from '../utils/type.utils';
import { EntitySwappableService } from './entity-swappable.service';

export interface DatabaseEntityOptions extends TypeOrmEntityOptions {
    swappable?: boolean;
    swap?: TFunction;
}

export function Entity(options: DatabaseEntityOptions = {}): ClassDecorator {
    return (constructor: TFunction) => {
        if (options.swappable && options.swap) {
            throw new Error(`${constructor.name} cannot be swappable and have swap entity at the same time`);
        }

        if (options.swappable) {
            EntitySwappableService.allowSwappable(constructor);
        }

        if (options.swap && !options.name) {
            options.name = options.swap.name.toLowerCase();
            EntitySwappableService.swapEntity(options.swap, constructor);
        }

        TypeOrmEntity(options)(constructor);
    };
}
