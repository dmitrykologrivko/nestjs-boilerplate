export default (request: any) => {
    return {
        error: 'Bad Request',
        message: [
            {
                children: [],
                constraints: {
                    resetPasswordTokenValid: 'Reset password token is not valid',
                },
                property: 'resetPasswordToken',
                value: request.resetPasswordToken,
            },
        ],
        statusCode: 400,
    };
};
