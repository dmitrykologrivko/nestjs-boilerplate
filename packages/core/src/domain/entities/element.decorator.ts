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
    embeddable?: boolean;
    itemCollection?: boolean;
    parent?: string | ((type?: any) => ObjectType<T>);
}

export function Element<T>(
    options?: ElementOptions<T>,
): ClassDecorator {
    // Extend with default options
    options = Object.assign({
        embeddable: true,
        itemCollection: false
    }, options);

    return (constructor: Function) => {
        if (!options.embeddable || options.itemCollection) {
            if (!options.parent) {
                throw new Error('typeFunctionOrTarget is required if segregated = true');
            }

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

            if (options.itemCollection) {
                ManyToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
            } else {
                OneToOne(options.parent, { onDelete: 'CASCADE' })(constructor.prototype, PARENT_PROPERTY);
            }

            JoinColumn({ name: 'parent' })(constructor.prototype, PARENT_PROPERTY);

            Entity(options)(constructor);
        }
    }
}
