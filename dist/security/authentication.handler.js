"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("../users/users.model");
const restify_errors_1 = require("restify-errors");
const jwt = require("jsonwebtoken");
const environment_1 = require("../common/environment");
exports.authenticate = (request, response, next) => {
    const { email, password } = request.body;
    users_model_1.User.findByEmail(email, '+password').then(user => {
        if (user && user.matches(password)) {
            /**
             * Generates the token jwt
             */
            const token = jwt.sign({ sub: user.email, iss: 'meat-api' }, environment_1.environment.security.apiSecret);
            response.json({ name: user.name, email: user.email, accessToken: token });
            return next(false);
        }
        else {
            return next(new restify_errors_1.NotAuthorizedError('Invalid credentials'));
        }
    }).catch(next);
};
