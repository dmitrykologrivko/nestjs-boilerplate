import { BaseEntity } from './base.entity';
import { SoftDeletable } from './soft-deletable.interface';

export abstract class BaseSoftDeletableEntity<T> extends BaseEntity<T> implements SoftDeletable {

    deleted: Date;

}
