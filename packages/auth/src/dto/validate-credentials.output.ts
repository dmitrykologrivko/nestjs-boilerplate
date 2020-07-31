import { Exclude } from 'class-transformer';
import { UserDto } from './user.dto';

@Exclude()
export class ValidateCredentialsOutput extends UserDto {}
