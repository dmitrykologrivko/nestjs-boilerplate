import { RetrieveQuery } from './retrieve-query.interface';

export class RetrieveInput<T = number> implements RetrieveQuery<T> {
    id: T;
}
