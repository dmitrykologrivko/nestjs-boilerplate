import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseValueObject<T = number> implements TimeStamped {

    @PrimaryGeneratedColumn({ name: 'id' })
    private _id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;
}
