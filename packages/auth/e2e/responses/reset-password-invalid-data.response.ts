export default () => {
    return {
        error: 'Bad Request',
        message: [
            {
                children: [],
                constraints: {
                    isJwt: 'resetPasswordToken must be a jwt string',
                    resetPasswordTokenValid: 'Reset password token is not valid',
                },
                property: 'resetPasswordToken',
            },
            {
                children: [],
                constraints: {
                    isNotEmpty: 'newPassword should not be empty',
                    maxLength: 'newPassword must be shorter than or equal to 128 characters',
                    minLength: 'newPassword must be longer than or equal to 8 characters',
                },
                property: 'newPassword',
            },
        ],
        statusCode: 400,
    };
};
