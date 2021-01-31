import { DeleteDateColumn } from 'typeorm';
import { BaseRootTypeormEntity } from './base-root-typeorm.entity';
import { SoftDeletable } from './soft-deletable.interface';

export abstract class BaseSoftDeletableRootTypeormEntity<T = number> extends BaseRootTypeormEntity<T> implements SoftDeletable {

    @DeleteDateColumn()
    deleted: Date;

}
