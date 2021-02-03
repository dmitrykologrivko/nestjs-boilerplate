import { Expose } from 'class-transformer';
import { Identifiable } from '../entities/identifiable.interface';

export abstract class BaseEntityDto<T = number> implements Identifiable<T> {

    @Expose()
    id: T;

}
