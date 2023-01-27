import { Identifiable } from '../../domain/entities/identifiable.interface';
import { BaseInput } from './base.input';
import { ListQuery } from './list-query.interface';
import { Authorizable } from './authorizable.interface';

export class ListInput<T extends Identifiable<any> = any>
    extends BaseInput
    implements ListQuery, Omit<Authorizable<T>, 'user'> {

    query: Record<string, any>;
    params: Record<string, any>;
    limit: number;
    offset: number;
    page: number;
    path: string;
    search: string;
    sortBy: string[];
    where: [string, string][];
    user?: T;
}
