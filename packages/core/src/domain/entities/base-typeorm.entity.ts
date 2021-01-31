import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseTypeormEntity<T> extends BaseEntity<T> implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

}
