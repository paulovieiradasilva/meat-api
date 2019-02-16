import * as restify from 'restify'
import { User } from '../users/users.model';
import { NotAuthorizedError } from 'restify-errors';
import * as jwt from 'jsonwebtoken';
import { environment } from '../common/environment';


/**
 * Performs token analysis
 * @param request 
 * @param response 
 * @param next 
 */
export const tokenParser: restify.RequestHandler = (request, response, next) => {
    const token = extractToken(request)
    if (token) {
        jwt.verify(token, environment.security.apiSecret, applayBearer(request, next))
    } else {
        next()
    }
}

/**
 * Extract request token
 * @param request 
 */
function extractToken(request: restify.Request) {
    const authorization = request.header('authorization')
    if (authorization) {
        const parts: string[] = authorization.split(' ')
        return (parts.length === 2 && parts[0] === 'Bearer') ? parts[1] : undefined
    }
}

function applayBearer(request: restify.Request, next): (error, decoded) => void {
    return (error, decoded) => {
        if (decoded) {
            User.findByEmail(decoded.sub).then(user => {
                if (user) {
                    request.authenticated = user
                }
                next()
            }).catch(next)
        } else {
            next()
        }
    }
}