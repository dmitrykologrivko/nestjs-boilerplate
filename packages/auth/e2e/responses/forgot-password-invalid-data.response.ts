export default () => {
    return {
        error: 'Bad Request',
        message: [
            {
                children: [],
                constraints: {
                    emailActive: 'Email is not found',
                    isEmail: 'email must be an email',
                },
                property: 'email',
            },
        ],
        statusCode: 400,
    };
};
