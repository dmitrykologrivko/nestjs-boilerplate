import { ClassType } from 'class-transformer/ClassTransformer';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityUpdatedEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    private static PREFIX = 'updated';

    static getName<T extends BaseEntity>(entityCls: ClassType<T>) {
        return super.getName(entityCls, EntityUpdatedEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: ClassType<T>,
    ) {
        super(data, entityCls, EntityUpdatedEvent.PREFIX);
    }
}
