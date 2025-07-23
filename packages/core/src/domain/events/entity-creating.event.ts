import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityCreatingEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    static PREFIX = 'creating';

    static getName<T extends BaseEntity>(entityCls: Constructor<T>) {
        return super.getName(entityCls, EntityCreatingEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        public readonly entityCls: Constructor<T>,
    ) {
        super(data, entityCls, EntityCreatingEvent.PREFIX);
    }
}
