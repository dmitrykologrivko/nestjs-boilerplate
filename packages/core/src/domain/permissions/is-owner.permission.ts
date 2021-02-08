import { BaseDomainPermission } from './base-domain.permission';
import { Ownable } from './ownable.interface';

export class IsOwnerPermission<I extends Ownable, E extends Ownable> extends BaseDomainPermission<I, E> {
    async hasEntityPermission(input: I, entity: E): Promise<boolean | undefined> {
        return input.userId() === entity.userId();
    }
}
