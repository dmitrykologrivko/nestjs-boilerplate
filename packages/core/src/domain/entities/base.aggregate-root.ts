import { BaseEntity } from './base.entity';

export abstract class BaseAggregateRoot<T = number> extends BaseEntity<T> {}
