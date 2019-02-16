import * as restify from 'restify'
import { User } from '../users/users.model';
import { NotAuthorizedError } from 'restify-errors';
import * as jwt from 'jsonwebtoken';
import { environment } from '../common/environment';

export const authenticate: restify.RequestHandler = (request, response, next) => {
    const { email, password } = request.body

    User.findByEmail(email, '+password').then(user => {
        if (user && user.matches(password)) {

            /**
             * Generates the token jwt
             */
            const token = jwt.sign({ sub: user.email, iss: 'meat-api' }, environment.security.apiSecret)
            response.json({ name: user.name, email: user.email, accessToken: token })
            return next(false)

        } else {
            return next(new NotAuthorizedError('Invalid credentials'))
        }
    }).catch(next)
}