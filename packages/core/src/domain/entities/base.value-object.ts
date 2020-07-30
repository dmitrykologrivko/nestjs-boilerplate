import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseValueObject implements TimeStamped {

    @PrimaryGeneratedColumn({ name: 'id' })
    private _id: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;
}
