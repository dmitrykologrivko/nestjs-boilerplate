import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseRootEntity } from './base.root-entity';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseRootTypeormEntity<T> extends BaseRootEntity<T> implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

}
