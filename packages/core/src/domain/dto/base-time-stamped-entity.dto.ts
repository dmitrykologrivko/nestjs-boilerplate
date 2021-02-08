import { TimeStamped } from '../entities/time-stamped.interface';
import { BaseEntityDto } from './base-entity.dto';
import { ReadOnly } from './read-only.decorator';

export abstract class BaseTimeStampedEntityDto<T = number> extends BaseEntityDto<T> implements TimeStamped {

    @ReadOnly()
    id: T;

    @ReadOnly()
    created: Date;

    @ReadOnly()
    updated: Date;

}
