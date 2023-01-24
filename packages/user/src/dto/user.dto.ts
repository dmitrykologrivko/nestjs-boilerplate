import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class UserDto extends BaseEntityDto {

    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    isActive: boolean;

    @Expose()
    isAdmin: boolean;

    @Expose()
    isSuperuser: boolean;

}
