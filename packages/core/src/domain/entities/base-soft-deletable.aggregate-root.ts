import { DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SoftDeletable } from './soft-deletable.interface';

export abstract class BaseSoftDeletableAggregateRoot<T> extends BaseEntity<T> implements SoftDeletable {

    @DeleteDateColumn()
    deleted: Date;
}
