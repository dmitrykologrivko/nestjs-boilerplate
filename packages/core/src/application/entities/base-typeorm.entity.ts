import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../domain/entities/base.entity';
import { TimeStamped } from '../../domain/entities/time-stamped.interface';

export abstract class BaseTypeormEntity<T = number> extends BaseEntity<T> implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

}
