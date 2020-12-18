import { DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SoftDeletable } from './soft-deletable.interface';

export abstract class BaseSoftDeletableEntity extends BaseEntity implements SoftDeletable {

    @DeleteDateColumn()
    deleted: Date;
}
