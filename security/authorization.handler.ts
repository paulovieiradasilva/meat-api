import * as restify from 'restify'
import { ForbiddenError } from 'restify-errors';

/**
 * Verify that the user is logged in
 * Checks whether the user has any access permissions
 * @param profiles 
 */
export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
    return (request, response, next) => {
        if (request.authenticated !== undefined && request.authenticated.hasAny(...profiles)) {
            next()
        } else {
            next(new ForbiddenError('Permission denied'))
        }
    }
}