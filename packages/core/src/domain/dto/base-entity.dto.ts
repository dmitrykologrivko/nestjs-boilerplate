import { Identifiable } from '../entities/identifiable.interface';
import { ReadOnly } from './read-only.decorator';

export abstract class BaseEntityDto<T = number> implements Identifiable<T> {

    @ReadOnly()
    id: T;

}
