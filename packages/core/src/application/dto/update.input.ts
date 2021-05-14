import { BasePayloadInput } from './base-payload.input';
import { BaseEntityDto } from './base-entity.dto';

export class UpdateInput<T extends BaseEntityDto> extends BasePayloadInput<T> {
    partial: boolean = false;
}
