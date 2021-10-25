# Controllers

Auth module provides REST API implementation of login/logout, changing/resetting passwords. It uses JWT authentication 
by default.

## Auth JWT controller

This API controller provides actions to login and logout operations.
It can be disabled in auth module options `enableAuthJwtApi`

```typescript
AuthModule.forRoot({ enableAuthJwtApi: false })
```

### Login

Performs login operation by provided username and password. Returns JWT token.

URL: `api/auth/jwt/login`\
Method: `POST`

Request payload example:
```json
{
    "username": "johnsmith@test.com", 
    "password": "qdaq12tr!gsegw"
}
```

Response payload example:

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo"
}
```

### Logout

Performs logout operation by provided JWT token with some reservations. Basically, you cannot log out by JWT tokens 
because they cannot be invalidated or fully removed according to their stateless nature. However, you can follow the tips:
* Choose a reasonable TTL (time to leave) time for JWT tokens. It is not a good idea to have long playing tokens.
* Once the user logout into the client app then removes JWT tokens from local storage.
* JWT tokens can be added to the block list in the backend. Use some in-memory store for this, for example, Redis.

So once you call logout action it will try to add JWT token to block list store (if it is configured).

URL: `api/auth/jwt/logout`\
Method: `POST`\
Authorization: `JWT`

Headers example:\
`Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo`

Request payload: None

Response payload: None

## Auth Password controller

This API controller provides actions to change or reset current user's password.
It can be disabled in auth module options `enableAuthPasswordApi`

```typescript
AuthModule.forRoot({ enableAuthPasswordApi: false })
```

### Change

Performs operation of changing password current user's password.

URL: `api/auth/password/change`\
Method: `POST`\
Authorization: `JWT`

Headers example:\
`Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo`

Request payload example:
```json
{
    "currentPassword": "qdaq12tr!gsegw", 
    "newPassword": "ad123#!dfdsfs9"
}
```

Response payload: None

### Forgot password

Sends an email with a reset password token if the user associated with this email exists and is active.

URL: `api/auth/password/forgot`\
Method: `POST`

Request payload example:
```json
{
    "email": "johnsmith@test.com"
}
```

Response payload: None

### Reset password

Sets a new password if provided reset password token is valid and the user is active.

URL: `api/auth/password/reset`\
Method: `POST`

Request payload example:
```json
{
    "resetPasswordToken": "eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo",
    "newPassword": "ad123#!dfdsfs9"
}
```

Response payload: None

### Validate reset password token

Validates provided reset password token.

URL: `api/auth/password/reset/validate`\
Method: `POST`

Request payload example:
```json
{
    "resetPasswordToken": "eyJhbGciOiJIUzI1NiJ9.e30.ZRrHA1JJJW8opsbCGfG_HACGpVUMN_a9IV7pAx_Zmeo"
}
```

Response payload: None
