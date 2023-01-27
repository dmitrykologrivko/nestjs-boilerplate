import { Identifiable } from '../../domain/entities/identifiable.interface';

export interface Authorizable<T extends Identifiable<any> = any> {
    user: T;
}
