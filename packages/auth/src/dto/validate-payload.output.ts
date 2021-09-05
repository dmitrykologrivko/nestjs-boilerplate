import { Exclude } from 'class-transformer';
import { UserDto } from '@nestjs-boilerplate/user';

@Exclude()
export class ValidatePayloadOutput extends UserDto {}
