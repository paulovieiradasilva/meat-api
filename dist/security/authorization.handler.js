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
            //LOG
            request.log.debug('User %s is authorized with profiles %j on route %s. Required profiles %j', request.authenticated._id, request.authenticated.profiles, request.path(), profiles);
            next();
        }
        else {
            if (request.authenticated) {
                //LOG
                request.log.debug('Permission denied for %s. Required profiles: %j. User profiles: %j', request.authenticated._id, profiles, request.authenticated.profiles);
            }
            next(new restify_errors_1.ForbiddenError('Permission denied'));
        }
    };
};
