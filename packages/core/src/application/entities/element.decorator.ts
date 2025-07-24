import {
    Entity,
    EntityOptions,
    OneToOne,
    ManyToOne,
    JoinColumn,
    ObjectType,
} from 'typeorm';
import { TFunction } from '../../utils/type.utils';

const PARENT_PROPERTY = '_parent';

export interface ElementOptions<T> extends EntityOptions {
    single?: boolean;
    parent: string | ((type?: any) => ObjectType<T>);
}

export function Element<T>(options: ElementOptions<T>): ClassDecorator {
    return (constructor: TFunction) => {
        if (options.single) {
            OneToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
        } else {
            ManyToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
        }

        JoinColumn()(constructor.prototype, PARENT_PROPERTY);

        Entity(options)(constructor);
    }
}
