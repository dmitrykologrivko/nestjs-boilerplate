import { DestroyQuery } from './destroy-query.interface';

export class DestroyInput<T = number> implements DestroyQuery<T> {
    id: T;
}
