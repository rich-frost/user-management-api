/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
const Boom = require('boom');
const mongoose = require('mongoose');
const validator = require('email-validator');
const User = require('../models/user');
const auth = require('../utils/auth');

const checkValidID = (id) => {
    const { ObjectId } = mongoose.Types;

    if (!ObjectId.isValid(id)) {
        throw Boom.badRequest('User ID is not valid format');
    }
};

const find = () => User.find();

const findUser = (request) => {
    checkValidID(request.params.id);

    return User.findOne({ _id: request.params.id }).then((user) => {
        if (user === null) {
            return Boom.notFound('User not found');
        }

        return user;
    });
};

const createUser = (request) => {
    const { username, email, password } = request.payload;

    const user = new User({
        username,
        email,
        password,
    });

    return user.save()
        .then(data => User.findById(data._id))
        .catch(error => Boom.badRequest(error));
};

const updateUser = (request) => {
    if (auth.checkAuthorization(request)) {
        try {
            checkValidID(request.params.id);

            const { id } = request.params;
            const { username, email } = request.payload;

            if (email && !validator.validate(email)) {
                return Boom.badRequest('Email is not valid format');
            }

            const update = {
                updated_at: Date.now(),
            };

            if (username) {
                update.username = username;
            }
            if (email) {
                update.email = email;
            }

            return User.findOneAndUpdate({ _id: id }, update, { new: true }).then((data) => {
                if (!data) {
                    return Boom.notFound(`User not found with ID: ${id}`);
                }
                return User.findById(data._id);
            });
        } catch (e) {
            return new Boom(e);
        }
    } else {
        return Boom.unauthorized('You are not authorized to patch user details');
    }
};

const deleteUser = (request) => {
    if (auth.checkAuthorization(request)) {
        const { id } = request.params;

        checkValidID(id);

        return User.findByIdAndDelete({ _id: id })
            .then((data) => {
                if (data !== null) {
                    return {
                        message: `Deleted user ${id}`,
                    };
                }
                throw Boom.notFound(`User ID ${id} not found`);
            })
            .catch(error => error);
    }
    throw Boom.unauthorized('You are not authorized to delete a user');
};

const deleteAllUsers = (request) => {
    if (auth.checkSUAuthorization(request)) {
        return User.deleteMany({})
            .then(() => ({
                message: 'Deleted all users',
            }));
    }
    throw Boom.unauthorized('You are not authorized to delete users');
};

module.exports = {
    find,
    findUser,
    createUser,
    updateUser,
    deleteUser,
    deleteAllUsers,
};
