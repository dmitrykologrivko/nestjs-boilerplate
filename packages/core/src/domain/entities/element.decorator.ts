import {
    Entity,
    EntityOptions,
    OneToOne,
    ManyToOne,
    ObjectType,
} from 'typeorm';

export interface ElementOptions<T> extends EntityOptions {
    single?: boolean;
    parent: string | ((type?: any) => ObjectType<T>);
}

export function Element<T>(options: ElementOptions<T>): ClassDecorator {
    return (constructor: Function) => {
        if (options?.single) {
            OneToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, '_parent');
        } else {
            ManyToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, '_parent');
        }

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
