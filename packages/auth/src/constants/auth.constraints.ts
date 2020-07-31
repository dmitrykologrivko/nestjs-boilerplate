export const EMAIL_ACTIVE_CONSTRAINT = {
    key: 'emailActive',
    message: 'Email is not found',
};

export const EMAIL_UNIQUE_CONSTRAINT = {
    key: 'emailUnique',
    message: 'User with this email already exists',
};

export const USERNAME_ACTIVE_CONSTRAINT = {
    key: 'usernameActive',
    message: 'Username is not found',
};

export const USERNAME_EXIST_CONSTRAINT = {
    key: 'usernameExists',
    message: 'User with this username does not exist',
};

export const USERNAME_UNIQUE_CONSTRAINT = {
    key: 'usernameUnique',
    message: 'User with this username already exists',
};

export const PASSWORD_MATCH_CONSTRAINT = {
    key: 'passwordMatch',
    message: 'Does not match with current user password',
};

export const CREDENTIALS_VALID_CONSTRAINT = {
    key: 'credentialsValid',
    message: 'Credentials is not valid',
};

export const JWT_TOKEN_VALID_CONSTRAINT = {
    key: 'jwtTokenValid',
    message: 'JWT token is not valid',
};

export const PAYLOAD_VALID_CONSTRAINT = {
    key: 'payloadValid',
    message: 'Payload is not valid',
};

export const RESET_PASSWORD_TOKEN_VALID_CONSTRAINT = {
    key: 'resetPasswordTokenValid',
    message: 'Reset password token is not valid',
};
