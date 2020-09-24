export default (request: any) => {
    return {
        statusCode: 400,
        error: 'Bad Request',
        message: [
            {
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
