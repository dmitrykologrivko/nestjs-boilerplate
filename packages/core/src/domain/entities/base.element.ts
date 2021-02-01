import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseValueObject } from './base.value-object';

export abstract class BaseElement<T, K = number> extends BaseValueObject {

    @PrimaryGeneratedColumn({ name: 'id' })
    private _id: K;

    private _parent: T;

}
