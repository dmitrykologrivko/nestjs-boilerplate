# Pagination

NestJS Boilerplate includes classes for customizable managing of pagination data.

## Base Pagination

NestJS Boilerplate defines `` class which can be used for implementing custom pagination logic.

Let's implement page pagination as example by inheriting from `BasePagination` class.

```typescript
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BasePagination, BasePaginatedContainer } from '@nestjs-boilerplate/core';

export interface PagePaginationQuery {
    limit: number;
    page: number;
}

export interface PagePaginationMeta {
    pageSize?: number;
}

export class PagePagination<E> extends BasePagination<E, BasePaginatedContainer<E>> {

    protected readonly page: number;

    protected readonly limit: number;

    protected readonly offset: number;

    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: PagePaginationQuery,
        protected readonly meta: PagePaginationMeta = { pageSize: 100 },
    ) {
        super(queryBuilderOrRepository);
        this.page = this.query.page || 1;
        this.limit = this.query.limit || this.meta.pageSize;
        this.offset = (this.page - 1) * this.limit;
    }

    paginate() {
        return this.queryBuilder
            .take(this.limit)
            .skip(this.offset);
    }

    async toPaginatedContainer(): Promise<BasePaginatedContainer<E>> {
        return { results: await this.paginate().getMany() };
    }
}
```

We have a page pagination query that can be passed from the presentation layer.

Method `paginate` contains the pagination logic where we use `SelectQueryBuilder`.\
Method `toPaginatedContainer` gets data from the database and maps it pagination container.\

Now we can use page pagination in the service.

```typescript
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { PagePagination, PagePaginationQuery } from './page.pagination';

export class NotesService {
    constructor(
        private readonly noteRepository: Repository<Note>,
    ) {}

    async getNotes(query: PagePaginationQuery) {
        return new PagePagination<Note>(
            this.noteRepository,
            query,
        ).toPaginatedContainer();
    }
}
```

## Build-in pagination

NestJS Boilerplate contains the following build-in pagination classes:
* PagePagination
* LimitOffsetPagination

### PagePagination

`PagePagination` class allows providing page pagination.

Use `PagePaginationQuery` to provide limit and page number.
Use `PagePaginationMeta` to provide page size. Default page size is 100 rows.

### LimitOffsetPagination

`LimitOffsetPagination` class allows providing limit - offest pagination.

Use `LimitOffsetPaginationQuery` to provide limit and offest.
Use `LimitOffsetPaginationMeta` to provide page size. Default page size is 100 rows.

### Providing queries for pagination

You can implement one of the following interfaces in your DTO to provide a pagination query to the selected pagination 
class instance: `PagePaginationQuery`, `LimitOffsetPaginationQuery`.
