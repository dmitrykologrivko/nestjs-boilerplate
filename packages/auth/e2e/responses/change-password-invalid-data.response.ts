export default () => {
    return {
        statusCode: 400,
        error: 'Bad Request',
        message: [
            {
                property: 'currentPassword',
                children: [],
                constraints: {
                    isNotEmpty: 'currentPassword should not be empty',
                    minLength: 'currentPassword must be longer than or equal to 8 characters',
                    maxLength: 'currentPassword must be shorter than or equal to 128 characters',
                    passwordMatch: 'Does not match with current user password',
                },
            },
            {
                property: 'newPassword',
                children: [],
                constraints: {
                    isNotEmpty: 'newPassword should not be empty',
                    minLength: 'newPassword must be longer than or equal to 8 characters',
                    maxLength: 'newPassword must be shorter than or equal to 128 characters',
                },
            },
        ],
    };
};
