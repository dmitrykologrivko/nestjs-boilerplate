import { BaseDomainPermission } from './base-domain.permission';
import { Ownable } from './ownable.interface';

export class IsOwnerPermission<I extends Ownable, E extends Ownable> extends BaseDomainPermission<I, E> {
    hasEntityPermission(input: I, entity: E): boolean | undefined {
        return input.userId() === entity.userId();
    }
}
