import * as promptSync from 'prompt-sync';
import { Logger } from '@nestjs/common';
import {
    Command,
    Handler,
    CliArgument,
    ValidationContainerException,
} from '@nestjs-boilerplate/core';
import { UserService } from '../services/user.service';

const prompt = promptSync({ sigint: true });

@Command({ name: 'users' })
export class UsersCommand {
    constructor(private readonly userService: UserService) {}

    @Handler({ shortcut: 'create-superuser' })
    async createSuperuser(
        @CliArgument({
            name: 'username',
            optional: true,
        })
        username?: string,

        @CliArgument({
            name: 'password',
            optional: true,
        })
        password?: string,

        @CliArgument({
            name: 'email',
            optional: true,
        })
        email?: string,

        @CliArgument({
            name: 'firstName',
            optional: true,
        })
        firstName?: string,

        @CliArgument({
            name: 'lastName',
            optional: true,
        })
        lastName?: string,
    ) {
        if (!username) {
            username = prompt('Username: ');
        }

        if (!password) {
            password = prompt.hide('Password: ');
        }

        if (!email) {
            email = prompt('Email: ');
        }

        if (!firstName) {
            firstName = prompt('First Name: ');
        }

        if (!lastName) {
            lastName = prompt('Last name: ');
        }

        try {
            const result = await this.userService.createUser({
                username,
                password,
                email,
                firstName,
                lastName,
                isActive: true,
                isAdmin: true,
                isSuperuser: true,
            });

            Logger.log(`Superuser "${username}" has been created`);
        } catch (e) {
            const message = (e as ValidationContainerException)
                .validationExceptions
                .map(exception => exception.toString())
                .join('');
            Logger.error(message);
        }
    }

    @Handler({ shortcut: 'change-password' })
    async changePassword(
        @CliArgument({
            name: 'username',
            optional: true,
        })
        username?: string,

        @CliArgument({
            name: 'password',
            optional: true,
        })
        password?: string,
    ) {
        if (!username) {
            username = prompt('Username: ');
        }

        if (!password) {
            password = prompt.hide('Password: ');
        }

        try {
            const result = await this.userService.forceChangePassword({
                username,
                newPassword: password,
            });
        } catch (e) {
            const message = e instanceof ValidationContainerException
                ? e.validationExceptions
                    .map(exception => exception.toString())
                    .join('')
                : e.toString();

            Logger.error(message);
        }
    }
}
