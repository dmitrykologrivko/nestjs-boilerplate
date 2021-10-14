# Decorators

## Authorized User decorator

The passport module attaches the authorized user instance to the request object. Usually, you can access it in your 
controllers by injecting the request object. An alternative method is to use `AuthorizedUser` param decorator 
to directly inject user instances.

```typescript
import {
    Request,
    Body,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiController } from '@nestjs-boilerplate/core';
import { UserService } from '@nestjs-boilerplate/user';
import {
    AuthorizedUser,
    JwtAuthGuard,
    ChangePasswordRequest,
} from '@nestjs-boilerplate/auth';

@ApiController('auth/password')
export class AuthPasswordController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('change')
    async changePassword(
        @AuthorizedUser() user,
        @Body() input: ChangePasswordRequest,
    ) {
        const result = await this.userService.changePassword({
            userId: user.id,
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
        });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }
}
```

## Bearer Token decorator

If you need to extract authorization bearer tokens from headers in your controllers then you can use `BearerToken` 
param decorator.

```typescript
import {
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ApiController } from '@nestjs-boilerplate/core';
import {
    BearerToken,
    JwtAuthGuard,
    JwtAuthService,
    JwtLoginInput,
} from '@nestjs-boilerplate/auth';

@ApiController('auth/jwt')
export class AuthJwtController {
    constructor(
        private readonly authService: JwtAuthService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@BearerToken() token) {
        const result = await this.authService.logout({ token });

        if (result.isErr()) {
            throw result.unwrapErr();
        }

        return result.unwrap();
    }
}
```
