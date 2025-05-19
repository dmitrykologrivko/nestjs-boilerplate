import { DeleteDateColumn } from 'typeorm';
import { BaseTypeormEntity } from './base-typeorm.entity';
import { SoftDeletable } from '../../domain/entities/soft-deletable.interface';

export abstract class BaseSoftDeletableTypeormEntity<T = number>
    extends BaseTypeormEntity<T>
    implements SoftDeletable {

    @DeleteDateColumn()
    deleted: Date;

}
