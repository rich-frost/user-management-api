/* eslint func-names: ["error", "never"] */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const validator = require('email-validator');

const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;


const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now },
});

UserSchema.pre('save', function (next) {
    if (!validator.validate(this.email)) {
        next(new Error('Email is not valid format'));
    }

    bcrypt
        .hash(this.password, BCRYPT_SALT_ROUNDS)
        .then((password) => {
            this.password = password;
            next();
        });
});

module.exports = mongoose.model('User', UserSchema);
