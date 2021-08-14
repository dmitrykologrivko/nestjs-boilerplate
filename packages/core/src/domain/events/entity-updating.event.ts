import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityUpdatingEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    private static PREFIX = 'updating';

    static getName<T extends BaseEntity>(entityCls: Constructor<T>) {
        return super.getName(entityCls, EntityUpdatingEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: Constructor<T>,
    ) {
        super(data, entityCls, EntityUpdatingEvent.PREFIX);
    }
}
