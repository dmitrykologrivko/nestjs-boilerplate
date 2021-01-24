import { BaseSoftDeletableEntity } from './base-soft-deletable.entity';

export abstract class BaseSoftDeletableAggregateRoot<T> extends BaseSoftDeletableEntity<T> {}
