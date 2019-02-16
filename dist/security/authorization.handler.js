"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
/**
 * Verify that the user is logged in
 * Checks whether the user has any access permissions
 * @param profiles
 */
exports.authorize = (...profiles) => {
    return (request, response, next) => {
        if (request.authenticated !== undefined && request.authenticated.hasAny(...profiles)) {
            next();
        }
        else {
            next(new restify_errors_1.ForbiddenError('Permission denied'));
        }
    };
};
