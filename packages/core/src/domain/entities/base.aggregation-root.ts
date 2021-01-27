import { BaseEntity } from './base.entity';

export abstract class BaseAggregationRoot<T = number> extends BaseEntity<T> {}
