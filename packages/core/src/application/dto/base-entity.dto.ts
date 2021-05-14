import { Identifiable } from '../../domain/entities/identifiable.interface';
import { BaseDto } from './base.dto';
import { ReadOnly } from './read-only.decorator';

export abstract class BaseEntityDto<T = number> extends BaseDto implements Identifiable<T> {

    @ReadOnly()
    id: T;

}
