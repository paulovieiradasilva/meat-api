import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import { NotFoundError } from 'restify-errors';
import { Restaurant } from './restaurant.model'
import { authorize } from '../security/authorization.handler';

class RestaurantsRouter extends ModelRouter<Restaurant> {

    constructor() {
        super(Restaurant)
    }

    public envelope(document) {
        let resource = super.envelope(document)
        resource._links.menu = `${this.basePath}/${resource._id}/menu`
        return resource
    }

    /**
     * Return a list of restaurants menu 
     */
    findMenu = (request, response, next) => {
        Restaurant.findById(request.params.id, "+menu").then(restaurant => {
            if (!restaurant) {
                throw new NotFoundError('Restaurante não encontrado')
            } else {
                response.json(restaurant.menu)
                return next()
            }
        }).catch(next)
    }

    /**
     * Updates a menu list of restaurants
     */
    replaceMenu = (request, response, next) => {
        Restaurant.findById(request.params.id).then(restaurant => {
            if (!restaurant) {
                throw new NotFoundError('Restaurante não encontrado')
            } else {
                restaurant.menu = request.body // Array de MenuItem.
                return restaurant.save()
            }
        }).then(restaurant => {
            response.json(restaurant.menu)
            return next()
        }).catch(next)
    }

    applyRoutes(application: restify.Server) {

        /**
         * Returns a list of recordes
         * GET
         */
        application.get(`${this.basePath}`, [this.findAll])

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

        /**
         * Return a list of restaurants menu
         * GET
         * @param :id
         */
        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu])

        /**
         * Updates a menu list of restaurants
         * PUT
         * @param :id
         */
        application.put(`${this.basePath}/:id/menu`, [authorize('admin'), this.validateId, this.replaceMenu])

    }
}

export const restaurantsRouter = new RestaurantsRouter()
