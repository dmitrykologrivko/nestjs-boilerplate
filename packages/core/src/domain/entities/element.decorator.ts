import {
    Entity,
    EntityOptions,
    PrimaryGeneratedColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
    ObjectType,
} from 'typeorm';

const ID_PROPERTY = '_id';
const PARENT_PROPERTY = '_parent';

export interface ElementOptions<T> extends EntityOptions {
    single?: boolean;
    parent: string | ((type?: any) => ObjectType<T>);
}

export function Element<T>(options: ElementOptions<T>): ClassDecorator {
    return (constructor: Function) => {
        Object.defineProperty(
            constructor.prototype,
            ID_PROPERTY,
            {
                configurable: true,
                writable: true,
            }
        )

        PrimaryGeneratedColumn({ name: 'id' })(constructor.prototype, ID_PROPERTY);

        Object.defineProperty(
            constructor.prototype,
            PARENT_PROPERTY,
            {
                configurable: true,
                writable: true,
            }
        )

        if (options?.single) {
            OneToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
        } else {
            ManyToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
        }

        JoinColumn({ name: 'parent' })(constructor.prototype, PARENT_PROPERTY);

        const parentName = typeof options.parent === 'string'
            ? options.parent
            : options.parent().name;

        Entity(
            {
                ...options,
                name: `${parentName}__${options.name || constructor.name}`,
            },
        )(constructor);
    }
}
