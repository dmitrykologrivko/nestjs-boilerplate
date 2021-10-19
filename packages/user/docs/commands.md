# Commands

You can use helpful CLI commands included into this package (See more on management commands [here](https://github.com/dmitrykologrivko/nestjs-boilerplate/blob/master/packages/core/docs/management.md))

## Create superuser

To create a new superuser you can run `users:create-superuser` command. It does not require providing user's info
in parameters but if you do not provide this then you will be asked to input this in a terminal.

Example:
`npm run command users:create-superuser --username=admin@test.com`

**Required params:**
None

**Optional params:**
`username` unique username of the user
`password` password of the user
`email` unique email of the user
`firstName` first name of the user
`lastName` last name of the user

## Change password

To force change user's password you can run `users:change-password` command. It does not require providing 
new credentials in parameters but if you do not provide this then you will be asked to input this in a terminal.

Example:
`npm run command users:change-password --username=admin@test.com --password=qwcac1f5df7dfs`

**Required params:**
None

**Optional params:**
`username` username of existing user
`password` new password of the user
