import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseRootEntity } from '../../domain/entities/base.root-entity';
import { TimeStamped } from '../../domain/entities/time-stamped.interface';

export abstract class BaseRootTypeormEntity<T = number>
    extends BaseRootEntity<T>
    implements TimeStamped {

    @PrimaryGeneratedColumn()
    id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

}
