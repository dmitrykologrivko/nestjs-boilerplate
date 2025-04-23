import { Constructor } from '../../utils/type.utils';
import { BaseEntity } from '../entities/base.entity';
import { BaseEvent } from './base.event';

export abstract class BaseEntityEvent<T extends BaseEntity> extends BaseEvent {

    static getName<T extends BaseEntity>(entityCls: Constructor<T>, prefix='base') {
        return `${prefix}-${entityCls.name.toLowerCase()}-entity-event`;
    }

    constructor(
        public readonly data: T,
        public readonly entityCls: Constructor<T>,
        public readonly prefix: string,
    ) {
        super(BaseEntityEvent.getName(entityCls, prefix));
    }
}
