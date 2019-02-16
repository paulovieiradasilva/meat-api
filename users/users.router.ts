import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import { User } from './users.model'
import { authenticate } from '../security/authentication.handler';
import { authorize } from '../security/authorization.handler';

class UsersRouter extends ModelRouter<User> {

  constructor() {
    super(User)
    this.on('beforeRender', document => {
      document.password = undefined
      //delete document.password
    })
  }

  public findBayEmail = (request, response, next) => {
    if (request.query.email) {
      User.findByEmail(request.query.email)
        .then(user => user ? [user] : [])
        .then(this.renderAll(response, next, {
          pageSize: this.pageSize,
          url: request.url
        })).catch(next)
    } else {
      next()
    }
  }

  public applyRoutes(application: restify.Server) {

    /**
     * Returns a list of recordes
     * GET
     */
    application.get({ path: `${this.basePath}`, version: '1.0.0' }, [authorize('admin'), this.findAll])
    application.get({ path: `${this.basePath}`, version: '2.0.0' }, [authorize('admin'), this.findBayEmail, this.findAll])

    /**
     * Returns a recorder
     * GET
     * @param :id
     */
    application.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById])

    /**
     * Creates a new record
     * POST
     */
    application.post(`${this.basePath}`, [authorize('admin'), this.save])

    /**
     * Updates one record
     * PUT
     * @param :id
     */
    application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])

    /**
     * Partially updates a record
     * PATCH
     * @param :id
     */
    application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])

    /**
     * Delete a record
     * DELETE
     * @param :id
     */
    application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])

    application.post(`${this.basePath}/authenticate`, authenticate)

  }
}

export const usersRouter = new UsersRouter()
