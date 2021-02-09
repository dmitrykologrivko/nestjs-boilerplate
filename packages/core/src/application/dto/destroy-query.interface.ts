import { Identifiable } from '../../domain/entities/identifiable.interface';

export interface DestroyQuery<T = number> extends Identifiable<T> {}
