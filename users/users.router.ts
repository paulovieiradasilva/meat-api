import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import { User } from './users.model'

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
    application.get({ path: `${this.basePath}`, version: '1.0.0' }, this.findAll)
    application.get({ path: `${this.basePath}`, version: '2.0.0' }, [this.findBayEmail, this.findAll])

    /**
     * Returns a recorder
     * GET
     * @param :id
     */
    application.get(`${this.basePath}/:id`, [this.validateId, this.findById])

    /**
     * Creates a new record
     * POST
     */
    application.post(`${this.basePath}`, this.save)

    /**
     * Updates one record
     * PUT
     * @param :id
     */
    application.put(`${this.basePath}/:id`, [this.validateId, this.replace])

    /**
     * Partially updates a record
     * PATCH
     * @param :id
     */
    application.patch(`${this.basePath}/:id`, [this.validateId, this.update])

    /**
     * Delete a record
     * DELETE
     * @param :id
     */
    application.del(`${this.basePath}/:id`, [this.validateId, this.delete])

  }
}

export const usersRouter = new UsersRouter()
