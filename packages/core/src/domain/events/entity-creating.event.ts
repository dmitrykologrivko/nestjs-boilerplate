import { ClassType } from 'class-transformer/ClassTransformer';
import { BaseEntity } from '../entities/base.entity';
import { BaseEntityEvent } from './base-entity.event';

export class EntityCreatingEvent<T extends BaseEntity> extends BaseEntityEvent<T> {

    private static PREFIX = 'creating';

    static getName<T extends BaseEntity>(entityCls: ClassType<T>) {
        return super.getName(entityCls, EntityCreatingEvent.PREFIX);
    }

    constructor(
        public readonly data: T,
        protected readonly entityCls: ClassType<T>,
    ) {
        super(data, entityCls, EntityCreatingEvent.PREFIX);
    }
}
