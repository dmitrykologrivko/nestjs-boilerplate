import { BaseInput } from './base.input';
import { DestroyQuery } from './destroy-query.interface';

export class DestroyInput<T = number> extends BaseInput implements DestroyQuery<T> {
    id: T;
}
