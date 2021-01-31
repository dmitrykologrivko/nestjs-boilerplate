import { PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { BaseValueObject } from './base.value-object';

export abstract class BaseElement<T, V = number> extends BaseValueObject {

    @PrimaryGeneratedColumn({ name: 'id' })
    private _id: V;

    @JoinColumn({ name: 'parent' })
    protected _parent: T;

}
