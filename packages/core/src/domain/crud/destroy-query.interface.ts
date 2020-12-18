import { Identifiable } from '../entities/identifiable.interface';

export interface DestroyQuery<T = number> extends Identifiable<T> {}
