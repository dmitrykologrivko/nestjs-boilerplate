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
        ],
        statusCode: 400,
    };
};
