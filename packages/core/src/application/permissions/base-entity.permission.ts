import { BaseInput } from '../dto/base.input';
import { BaseEntity } from '../../domain/entities/base.entity';

export abstract class BaseEntityPermission<I extends BaseInput = BaseInput, E extends BaseEntity = BaseEntity> {
    constructor(readonly message: string) {}

    abstract hasEntityPermission(input: I, entity: E): Promise<boolean>;

}
