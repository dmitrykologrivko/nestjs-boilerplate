import { BaseDto } from './base.dto';

export abstract class BaseInput extends BaseDto {
    extra?: Record<string, any> = {};
}
