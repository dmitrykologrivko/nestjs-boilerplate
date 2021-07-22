# Filters

The filter is a class in NestJS Boilerplate that allows creating a generic filter for database queries.
For example, you can create a search, ordering, or conditions filters to have dynamic logic of building query data 
from the presentation layer. Also, you can combine several filters into one query based on your needs.

## Base Filter

NestJS Boilerplate defines `BaseFilter` class which can be used for implementing custom filter logic.

Let's implement search filter as example by inheriting from `BaseFilter` class.

```typescript
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { BaseFilter } from '@nestjs-boilerplate/core';

export interface SearchQuery {
    search: string;
}

export interface SearchMeta {
    searchFields: string[];
}

export class SearchFilter<E> extends BaseFilter<E> {
    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: SearchQuery,
        protected readonly meta: SearchMeta,
    ) {
        super(queryBuilderOrRepository);

        if (!meta.searchFields || meta.searchFields.length === 0) {
            throw new Error('Must be provided at least one search field!');
        }
    }

    filter(): SelectQueryBuilder<E> {
        if (!this.query.search) {
            return this.queryBuilder;
        }

        const searchFields: string[] = this.meta.searchFields
            .map(this.adaptFieldName.bind(this));

        return this.queryBuilder.andWhere(new Brackets(qb => {
            for (const field of searchFields) {
                const index = this.getParamIndex(field);
                qb.orWhere(`${field} LIKE :${index}`, { [index]: `%${this.query.search}%` });
            }
        }));
    }
}
```

We have a search query that can be passed from the presentation layer. Also, we define a list of fields that
we will use for searching for the desired results.

Method filter contains the filtering logic where we use `SelectQueryBuilder`.\
Method `adaptFieldName` of base class tries to adapt field name for using in query builder to avoid mistakes in field
paths. For example "id" field name will be adapted to "entityAlias.id" or "entityAlias.nestedAlias.id" will be adapted
to "nestedAlias.id".\
Method `getParamIndex` of base class returns unique param index that can be used in where statement. Basically, param 
index will be based on field name plus high-resolution real time (seconds, nanoseconds).

Now we can use search filter in the service.

```typescript
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { SearchFilter, SearchQuery } from './search.filter';

export class NotesService {
    constructor(
        private readonly noteRepository: Repository<Note>,
    ) {}

    async searchNotes(query: SearchQuery) {
        return new SearchFilter<Note>(
            this.noteRepository,
            query,
            {
                searchFields: ['note', 'additionalDescription'],
            }
        ).getMany();
    }
}
```

## Build-in filters

NestJS Boilerplate contains the following build-in filter classes:
* OrderingFilter
* SearchFilter
* WhereFilter

### Ordering Filter

`OrderingFilter` class allows providing a list of entity fields that you want to sort by ASC or DESC.

Use `OrderingQuery` to provide a list of entity fields to ordering. For example `["id", "name"]` for ASC order.
For example `["-id", "-name"]` for DESC order.\
Use `OrderingMeta` to provide a list of allowed entity fields for ordering. Original entity field can be masked with 
any other names but in this case you need to provide a record of field names like `{ "aliasName": "realName" }`.
In ordering query use masked name instead of real.

### Search Filter

`SearchFilter` class allows searching for text results.

Use `SearchQuery` to provide search argument.\
Use `SearchMeta` to provide list of entity fields that we will use for searching for the desired results.

### Where Filter

`WhereFilter` class allows providing dynamic where query by allowed fields.

Use `WhereQuery` to provide a list of entity fields, conditions and condition values.
For example `[['name__eq', 'John'], ['age__gt', '18']]`.

In the following table, you can find a list of supported conditions:

| condition | operation                                |
|-----------|------------------------------------------|
| __eq      | equals                                   |
| __ne      | not equals                               |
| __gt      | greater then                             |
| __lt      | less then                                |
| __gte     | greater then or equal                    |
| __lte     | less then or equal                       |
| __starts  | starts with                              |
| __ends    | ends with                                |
| __cont    | contains                                 |
| __excl    | not contains                             |
| __in      | in list of values (comma separated )     |
| __isnull  | is null                                  |
| __notnull | not null                                 |
| __between | between two values (comma separated)     |

Use `WhereMeta` to provide a list of allowed entity fields for where statement. Original entity field can be masked with
any other names but in this case you need to provide a record of field names like `{ "aliasName": "realName" }`.
In where query use masked name instead of real.

### Providing queries for filters

You can implement one of the following interfaces in your DTO to provide a filter query to the selected filter class 
instance: `OrderingQuery`, `SearchQuery`, `WhereQuery`.
