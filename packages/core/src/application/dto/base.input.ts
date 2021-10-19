import { Exclude } from 'class-transformer';
import { BaseDto } from './base.dto';

export abstract class BaseInput extends BaseDto {

    @Exclude()
    extra?: Record<string, any> = {};

}
