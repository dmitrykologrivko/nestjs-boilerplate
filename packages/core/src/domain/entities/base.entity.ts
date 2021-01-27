import { Identifiable } from './identifiable.interface';
import { TimeStamped } from './time-stamped.interface';

export abstract class BaseEntity<T = number> implements Identifiable<T>, TimeStamped {

    id: T;

    created: Date;

    updated: Date;

}
