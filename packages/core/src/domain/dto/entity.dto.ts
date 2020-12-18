import { Expose } from 'class-transformer';
import { Identifiable } from '../entities/identifiable.interface';

export class EntityDto<T = number> implements Identifiable<T> {

    @Expose()
    id: T;

}
