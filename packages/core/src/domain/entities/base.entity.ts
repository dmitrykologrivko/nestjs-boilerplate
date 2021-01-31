import { Identifiable } from './identifiable.interface';

export abstract class BaseEntity<T = number> implements Identifiable<T> {
    id: T;
}
