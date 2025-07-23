import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityCreatedEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    static PREFIX = 'created';

    static getName<T extends BaseEntity>(entityCls: Constructor<T>) {
        return super.getName(entityCls, EntityCreatedEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        public readonly entityCls: Constructor<T>,
    ) {
        super(data, entityCls, EntityCreatedEvent.PREFIX);
    }
}
