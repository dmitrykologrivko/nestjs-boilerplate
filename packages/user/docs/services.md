# Services

## User Service

`UserService` is an application service class that exposes domain operations related to the User entity.

| Method               | Description                                                                |
|----------------------|----------------------------------------------------------------------------|
| createUser           | Creates a new user entity                                                  |
| changePassword       | Allows changing the user password if provided current password is correct  |
| forceChangePassword  | Allows force changing the user password                                    |
| forgotPassword       | Generates reset password token and sends to user email                     |
| resetPassword        | Resets user password by reset password token                               |

## User Password Service

`UserPasswordService` is a domain class that provides functionality to interact with credentials and token of reset password.

| Method                       | Description                                                                |
|------------------------------|----------------------------------------------------------------------------|
| validateCredentials          | Validates provided username and password. Returns user instance            |
| comparePassword              | Checks if a provided password is matched with the current user's password  |
| generateResetPasswordToken   | Generates token that can be used to reset password                         |
| validateResetPasswordToken   | Validates provided reset password token. Returns user instance             |
| isResetPasswordTokenValid    | Checks if a provided reset password token valid                            |

## User Verification Service

`UserVerificationService` is a domain class that provides functionality to validate user constraints.

| Method             | Description                                                                |
|--------------------|----------------------------------------------------------------------------|
| isEmailUnique      | Checks that provided email is not used                                     |
| isEmailActive      | Checks that user with provided email is not deactivated                    |
| isUsernameUnique   | Checks that provided username is not used                                  |
| isUsernameExists   | Checks that provided username is used                                      |
