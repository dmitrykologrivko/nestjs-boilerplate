import { BaseDto } from './base.dto';
import { BaseInput } from './base.input';

export class BasePayloadInput<T extends BaseDto> extends BaseInput {
    payload: T;
}
