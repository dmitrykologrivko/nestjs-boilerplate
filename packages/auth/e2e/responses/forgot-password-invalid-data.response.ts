export default () => {
    return {
        error: 'Bad Request',
        message: [
            {
                children: [],
                constraints: {
                    isEmail: 'email must be an email',
                },
                property: 'email',
            },
        ],
        statusCode: 400,
    };
};
