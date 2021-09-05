import { Exclude } from 'class-transformer';
import { UserDto } from '@nestjs-boilerplate/user';

@Exclude()
export class ValidateCredentialsOutput extends UserDto {}
