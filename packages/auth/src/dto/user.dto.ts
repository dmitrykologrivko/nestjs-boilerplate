import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class UserDto extends BaseEntityDto {

    @Expose()
    id: number;

    @Expose({ name: '_username' })
    username: string;

    @Expose({ name: '_email' })
    email: string;

    @Expose({ name: '_firstName' })
    firstName: string;

    @Expose({ name: '_lastName' })
    lastName: string;

    @Expose({ name: '_isActive' })
    isActive: boolean;

    @Expose({ name: '_isAdmin' })
    isAdmin: boolean;

    @Expose({ name: '_isSuperuser' })
    isSuperuser: boolean;

}
