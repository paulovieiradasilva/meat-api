"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("../users/users.model");
const jwt = require("jsonwebtoken");
const environment_1 = require("../common/environment");
/**
 * Performs token analysis
 * @param request
 * @param response
 * @param next
 */
exports.tokenParser = (request, response, next) => {
    const token = extractToken(request);
    if (token) {
        jwt.verify(token, environment_1.environment.security.apiSecret, applayBearer(request, next));
    }
    else {
        next();
    }
};
/**
 * Extract request token
 * @param request
 */
function extractToken(request) {
    const authorization = request.header('authorization');
    if (authorization) {
        const parts = authorization.split(' ');
        return (parts.length === 2 && parts[0] === 'Bearer') ? parts[1] : undefined;
    }
}
function applayBearer(request, next) {
    return (error, decoded) => {
        if (decoded) {
            users_model_1.User.findByEmail(decoded.sub).then(user => {
                if (user) {
                    request.authenticated = user;
                }
                next();
            }).catch(next);
        }
        else {
            next();
        }
    };
}
