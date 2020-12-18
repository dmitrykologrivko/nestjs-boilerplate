import { Identifiable } from '../entities/identifiable.interface';

export interface RetrieveQuery<T = number> extends Identifiable<T> {}
