const Joi = require('joi');
const UserController = require('../controllers/user-controller');

module.exports = [
    {
        method: 'GET',
        path: '/api/v1/users',
        config: {
            description: 'Get all the users',
            notes: 'Returns all the users stored in the MongoDB',
            tags: ['api', 'v1', 'users'],
        },
        handler: UserController.find,
    },
    {
        method: 'GET',
        path: '/api/v1/users/{id}',
        config: {
            description: 'Get user based on id',
            notes: 'Gets a single user based on their id',
            tags: ['api', 'v1', 'user'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('The id of the user'),
                },
            },
        },
        handler: UserController.findUser,
    },
    {
        method: 'POST',
        path: '/api/v1/users',
        config: {
            description: 'Create a user',
            notes: 'Allows you to create a user',
            tags: ['api', 'v1', 'user', 'create'],
            validate: {
                payload: Joi.object({
                    username: Joi.string(),
                    email: Joi.string(),
                    password: Joi.string(),
                }),
            },
        },
        handler: UserController.createUser,
    },
    {
        method: 'PATCH',
        path: '/api/v1/users/{id}',
        config: {
            description: 'Update user details',
            notes: 'Update details of an existing user',
            tags: ['api', 'v1', 'user', 'update'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('The ID of the user to patch'),
                },
                payload: Joi.object({
                    username: Joi.string(),
                    email: Joi.string(),
                }),
            },
        },
        handler: UserController.updateUser,
    },
    {
        method: 'DELETE',
        path: '/api/v1/users/{id}',
        config: {
            description: 'Delete a user',
            notes:
        'Deletes a user from the MongoDB, to delete the user you need the API key in the header of the request',
            tags: ['api', 'v1', 'user', 'delete'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('The ID of the user'),
                },
            },
        },
        handler: UserController.deleteUser,
    },
    {
        method: 'DELETE',
        path: '/api/v1/remove-all-users',
        config: {
            description: 'Remove all users',
            notes: 'Deletes all users from the DB for testing',
            tags: ['api', 'v1', 'users', 'delete'],
        },
        handler: UserController.deleteAllUsers,
    },
];
