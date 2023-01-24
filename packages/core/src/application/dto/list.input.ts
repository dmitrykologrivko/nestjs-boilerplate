import { BaseInput } from './base.input';
import { ListQuery } from './list-query.interface';

export class ListInput extends BaseInput implements ListQuery {
    query: Record<string, any>;
    params: Record<string, any>;
    limit: number;
    offset: number;
    page: number;
    path: string;
    search: string;
    sortBy: string[];
    where: [string, string][];
}
