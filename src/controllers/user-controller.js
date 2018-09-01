const User = require("../models/User");
const Boom = require("boom");
const bcrypt = require("bcrypt");
const BCRYPT_SALT_ROUNDS = 12;
const mongoose = require("mongoose");
const auth = require("../utils/auth");
const validator = require("email-validator");

const find = (request, reply) => {
    return User.find();
};

const findUser = (request, reply) => {
    if (!request.params.id) {
        return Boom.badRequest("User ID is a required parameter");
    }

    const ObjectID = mongoose.Types.ObjectId;
    if (!ObjectID.isValid(request.params.id)) {
        return Boom.badRequest("User ID is not valid format");
    }

    return User.findOne({ _id: request.params.id }).then(user => {
        if (user === null) {
            return Boom.notFound("User not found");
        }

        return user;
    });
};

const createUser = (request, reply) => {
    const { username, email, password } = request.payload;

    if (!validator.validate(email)) {
        return Boom.badRequest("Email is not valid format");
    }
    return bcrypt
        .hash(password, BCRYPT_SALT_ROUNDS)
        .then(password => {
            const user = new User({
                username,
                email,
                password
            });

            return user.save();
        })
        .then(data => {
            return User.findById(data._id);
        })
        .catch(error => {
            console.log(error);
            return Boom("Error saving user details: " + error);
        });
};

const updateUser = (request, reply) => {
    const id = request.params.id;
    const ObjectID = mongoose.Types.ObjectId;

    if (auth.checkAuthorization(request)) {
        try {
            //TODO refactor into helper
            if (!ObjectID.isValid(id)) {
                return Boom.badRequest("User ID is not valid format");
            }

            const username = request.payload.username;
            const email = request.payload.email;

            if (email && !validator.validate(email)) {
                return Boom.badRequest("Email is not valid format");
            }

            let update = {
                updated_at: Date.now()
            };

            if (username) {
                update["username"] = username;
            }
            if (email) {
                update["email"] = email;
            }

            return User.findOneAndUpdate({ _id: id }, update).then(data => {
                if (!data) {
                    return Boom.notFound("User not found with ID: " + id);
                }
                return User.findById(data._id);
            });
        } catch (e) {
            console.log(e);
            return e;
        }
    } else {
        throw Boom.unauthorized("You are not authorized to patch user details");
    }
};

const deleteUser = (request, reply) => {
    const id = request.params.id;
    const ObjectID = mongoose.Types.ObjectId;

    if (!ObjectID.isValid(id)) {
        throw Boom.badRequest("ID is not valid");
    }
    if (auth.checkAuthorization(request)) {
        return User.findByIdAndDelete({ _id: id })
            .then(data => {
                if (data !== null) {
                    return {
                        message: "Deleted user " + id
                    };
                } else {
                    throw Boom.notFound("User ID " + id + " not found");
                }
            })
            .catch(error => {
                console.log(error);
                return error;
            });
    } else {
        throw Boom.unauthorized("You are not authorized to delete a user");
    }
};

const deleteAllUsers = (request, reply) => {
    if (auth.checkAuthorization(request)) {
        try {
            User.deleteMany({});

            return {
                message: "Removed all users"
            };
        } catch (e) {
            return e;
        }
    } else {
        throw Boom.unauthorized("You are not authorized to delete users");
    }
};

module.exports = {
    find,
    findUser,
    createUser,
    updateUser,
    deleteUser,
    deleteAllUsers
};
