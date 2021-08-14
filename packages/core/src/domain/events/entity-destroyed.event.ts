import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityDestroyedEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    private static PREFIX = 'destroyed';

    static getName<T extends BaseEntity>(entityCls: Constructor<T>) {
        return super.getName(entityCls, EntityDestroyedEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: Constructor<T>,
    ) {
        super(data, entityCls, EntityDestroyedEvent.PREFIX);
    }
}
