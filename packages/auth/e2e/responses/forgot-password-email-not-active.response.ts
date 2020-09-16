export default (request: any) => {
    return {
        error: 'Bad Request',
        message: [
            {
                children: [],
                constraints: {
                    emailActive: 'Email is not found',
                },
                property: 'email',
                target: {
                    email: request.email,
                    newPassword: 'new-password',
                },
                value: request.email,
            },
        ],
        statusCode: 400,
    };
};
