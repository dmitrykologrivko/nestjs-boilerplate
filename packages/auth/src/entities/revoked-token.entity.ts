import { Column, ManyToOne } from 'typeorm';
import {
    Entity,
    BaseTypeormEntity,
    getTargetName,
    Validate,
    ValidationContainerException,
    Result,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/user';

@Entity()
export class RevokedToken extends BaseTypeormEntity {

    @Column({
        name: 'token',
        unique: true,
    })
    private readonly _token: string;

    @ManyToOne(getTargetName(User))
    private readonly _user: User;

    private constructor(token: string, user: User) {
        super();
        this._token = token;
        this._user = user;
    }

    static create(
        token: string,
        user: User,
    ): Result<RevokedToken, ValidationContainerException> {
        const validateResult = Validate.withResults([
            RevokedToken.validateToken(token),
            RevokedToken.validateUser(user),
        ]);

        return validateResult.map(() => new RevokedToken(token, user));
    }

    get token(): string {
        return this._token;
    }

    get user(): User {
        return this._user;
    }

    private static validateToken(token: string) {
        return Validate.withProperty('token', token)
            .isNotEmpty()
            .isValid();
    }

    private static validateUser(user: User) {
        return Validate.withProperty('user', user)
            .isNotEmpty()
            .isValid();
    }
}
