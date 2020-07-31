import { Exclude } from 'class-transformer';
import { UserDto } from './user.dto';

@Exclude()
export class ValidatePayloadOutput extends UserDto {}
