import { BaseEntity } from './base.entity';

export abstract class BaseRootEntity<T = number> extends BaseEntity<T> {}
