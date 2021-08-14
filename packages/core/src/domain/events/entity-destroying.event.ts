import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityDestroyingEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    private static PREFIX = 'destroying';

    static getName<T extends BaseEntity>(entityCls: Constructor<T>) {
        return super.getName(entityCls, EntityDestroyingEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: Constructor<T>,
    ) {
        super(data, entityCls, EntityDestroyingEvent.PREFIX);
    }
}
