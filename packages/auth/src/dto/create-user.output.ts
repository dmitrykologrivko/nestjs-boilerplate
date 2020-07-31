import { Exclude } from 'class-transformer';
import { UserDto } from './user.dto';

@Exclude()
export class CreateUserOutput extends UserDto {}
