import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Identifiable } from './identifiable.interface';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseEntity<T = number> implements Identifiable<T>, TimeStamped {

    @PrimaryGeneratedColumn()
    id: T;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;
}
