import { BaseInput } from '../dto/base.input';

export abstract class BasePermission<I extends BaseInput = BaseInput> {
    constructor(readonly message: string) {}

    abstract hasPermission(input: I): Promise<boolean>;

}
