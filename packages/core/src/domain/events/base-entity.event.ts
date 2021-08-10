import { ClassType } from 'class-transformer/ClassTransformer';
import { BaseEntity } from '../entities/base.entity';
import { BaseEvent } from './base.event';

export abstract class BaseEntityEvent<T extends BaseEntity> extends BaseEvent {

    static getName<T extends BaseEntity>(entityCls: ClassType<T>, prefix='base') {
        return `${prefix}-${entityCls.name.toLowerCase()}-entity-event`;
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: ClassType<T>,
        protected readonly prefix: string,
    ) {
        super(BaseEntityEvent.getName(entityCls, prefix));
    }
}
