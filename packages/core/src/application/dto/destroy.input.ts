import { Identifiable } from '../../domain/entities/identifiable.interface';
import { BaseInput } from './base.input';
import { Authorizable } from './authorizable.interface';

export class DestroyInput<T = number, E extends Identifiable<any> = any>
    extends BaseInput
    implements Identifiable<T>, Omit<Authorizable<E>, 'user'> {

    id: T;
    user?: E;
}
