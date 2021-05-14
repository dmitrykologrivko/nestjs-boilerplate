import { BaseInput } from './base.input';
import { RetrieveQuery } from './retrieve-query.interface';

export class RetrieveInput<T = number> extends BaseInput implements RetrieveQuery<T> {
    id: T;
}
