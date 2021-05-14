import { BasePayloadInput } from './base-payload.input';
import { BaseDto } from './base.dto';

export class CreateInput<T extends BaseDto> extends BasePayloadInput<T> {}
