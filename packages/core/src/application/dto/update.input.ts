import { Identifiable } from '../../domain/entities/identifiable.interface';
import { BaseInput } from './base.input';
import { BaseDto } from './base.dto';
import { Payloadable } from './payloadable.interface';
import { Authorizable } from './authorizable.interface';

export class UpdateInput<T extends BaseDto, E extends Identifiable<any> = any>
    extends BaseInput
    implements Payloadable<T>, Omit<Authorizable<E>, 'user'> {
    payload: T;
    partial: boolean = false;
    user?: E;
}
