import { Repository, SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';
import { BaseFilter } from './base.filter';

type WhereCondition = [string, ObjectLiteral];

export const QUERY_CONDITIONS = {
    eq: '__eq',
    ne: '__ne',
    gt: '__gt',
    lt: '__lt',
    gte: '__gte',
    lte: '__lte',
    starts: '__starts',
    ends: '__ends',
    cont: '__cont',
    excl: '__excl',
    in: '__in',
    notin: '__notin',
    isnull: '__isnull',
    notnull: '__notnull',
    between: '__between',
};

export const QUERY_NAME_CONDITION_REGEX = Object.values(QUERY_CONDITIONS)
    .reduce((prev, current, index, arr) => {
        let newValue = `${prev}|${current}`;

        if (index === 1) {
            newValue = `^(.*)(${newValue}`;
        }

        if (index === arr.length - 1) {
            newValue = `${newValue})$`;
        }

        return newValue;
    });

export interface WhereQuery {
    where: [string, string][];
}

export interface WhereMeta {
    filterFields: string[] | Record<string, string>;
}

export class WhereFilter<E> extends BaseFilter<E> {
    constructor(
        queryBuilderOrRepository: Repository<E> | SelectQueryBuilder<E>,
        protected readonly query: WhereQuery,
        protected readonly meta: WhereMeta,
    ) {
        super(queryBuilderOrRepository);

        if (!meta.filterFields || meta.filterFields.length === 0) {
            throw new Error('Must be provided at least one filter field!');
        }
    }

    filter(): SelectQueryBuilder<E> {
        const whereConditions: WhereCondition[] = this.getWhereConditions(this.query.where);

        if (whereConditions.length === 0) {
            return this.queryBuilder;
        }

        return this.queryBuilder.andWhere(new Brackets(qb => {
            for (const condition of whereConditions) {
                qb.andWhere(condition[0], condition[1]);
            }
        }));
    }

    private getWhereConditions(query: [string, string][] = []): WhereCondition[] {
        return query.map(param => {
            const [queryNameAndCondition, queryValue] = param;

            const match = queryNameAndCondition.match(QUERY_NAME_CONDITION_REGEX);

            if (!match) {
                return null;
            }

            return [match[1], match[2], queryValue] as [string, string, string];
        }).filter(queryTuple => {
            if (!queryTuple) {
                return false;
            }

            return Array.isArray(this.meta.filterFields)
                ? this.meta.filterFields.includes(queryTuple[0])
                : this.meta.filterFields.hasOwnProperty(queryTuple[0]);
        }).map(queryTuple => {
            const [queryName, queryCondition, queryValue] = queryTuple;

            const field = this.adaptFieldName(queryName);
            const index = this.getParamIndex(field);

            let whereCondition: WhereCondition;

            switch (queryCondition) {
                case QUERY_CONDITIONS.eq:
                    whereCondition = [`${field} = :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.ne:
                    whereCondition = [`${field} != :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.gt:
                    whereCondition = [`${field} > :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.lt:
                    whereCondition = [`${field} < :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.gte:
                    whereCondition = [`${field} >= :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.lte:
                    whereCondition = [`${field} <= :${index}`, { [index]: queryValue }];
                    break;
                case QUERY_CONDITIONS.starts:
                    whereCondition = [`${field} LIKE :${index}`, { [index]: `${queryValue}%` }];
                    break;
                case QUERY_CONDITIONS.ends:
                    whereCondition = [`${field} LIKE :${index}`, { [index]: `%${queryValue}` }];
                    break;
                case QUERY_CONDITIONS.cont:
                    whereCondition = [`${field} LINE :${index}`, { [index]: `%${queryValue}%` }];
                    break;
                case QUERY_CONDITIONS.excl:
                    whereCondition = [`${field} NOT LINE :${index}`, { [index]: `%${queryValue}%` }];
                    break;
                case QUERY_CONDITIONS.in:
                    whereCondition = [
                        `${field} IN (:...${index})`,
                        { [index]: queryValue.split(',').filter(value => !!value) },
                    ];
                    break;
                case QUERY_CONDITIONS.notin:
                    whereCondition = [
                        `${field} NOT IN (:...${index})`,
                        { [index]: queryValue.split(',').filter(value => !!value) },
                    ];
                    break;
                case QUERY_CONDITIONS.isnull:
                    whereCondition = [`${field} IS NULL`, null];
                    break;
                case QUERY_CONDITIONS.notnull:
                    whereCondition = [`${field} IS NOT NULL`, null];
                    break;
                case QUERY_CONDITIONS.between:
                    const val1Index = this.getParamIndex(`${field}_val1`);
                    const val2Index = this.getParamIndex(`${field}_val2`);
                    const [val1, val2] = queryValue.split(',').filter(value => !!value);
                    whereCondition = [
                        `${field} BETWEEN :${val1Index} AND :${val2Index}`,
                        { [val1Index]: val1, [val2Index]: val2 },
                    ];
                    break;
            }

            return whereCondition;
        });
    }
}
