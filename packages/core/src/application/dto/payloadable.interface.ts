import { BaseDto } from './base.dto';

export interface Payloadable<T extends BaseDto> {
    payload: T;
}
