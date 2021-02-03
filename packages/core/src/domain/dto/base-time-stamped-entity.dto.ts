import { Expose } from 'class-transformer';
import { TimeStamped } from '../entities/time-stamped.interface';
import { BaseEntityDto } from './base-entity.dto';

export abstract class BaseTimeStampedEntityDto<T = number> extends BaseEntityDto<T> implements TimeStamped {

    @Expose()
    id: T;

    @Expose()
    created: Date;

    @Expose()
    updated: Date;

}
