import { BasePaginatedContainer } from './base-paginated-container.interface';

export interface PaginatedContainer<T> extends BasePaginatedContainer<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];
}
