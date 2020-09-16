export default (request: any) => {
    return {
        statusCode: 400,
        error: 'Bad Request',
        message: [
            {
                target: request,
                value: request.currentPassword,
                property: 'currentPassword',
                children: [],
                constraints: {
                    passwordMatch: 'Does not match with current user password',
                },
            },
        ],
    };
};
