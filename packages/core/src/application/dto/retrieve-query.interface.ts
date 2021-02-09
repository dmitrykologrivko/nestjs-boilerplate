import { Identifiable } from '../../domain/entities/identifiable.interface';

export interface RetrieveQuery<T = number> extends Identifiable<T> {}
