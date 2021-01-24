import { Expose } from 'class-transformer';
import { Identifiable } from '../entities/identifiable.interface';
import { TimeStamped } from '../entities/time-stamped.interface';

export class TimeStampedEntityDto<T = number> implements Identifiable<T>, TimeStamped {

    @Expose()
    id: T;

    @Expose()
    created: Date;

    @Expose()
    updated: Date;
}
