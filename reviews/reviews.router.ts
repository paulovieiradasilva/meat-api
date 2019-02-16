import { ModelRouter } from '../common/model-router'
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import { Review } from './reviews.model'

class ReviewsRouter extends ModelRouter<Review> {

    constructor() {
        super(Review)
    }

    public envelope(document) {
        let resource = super.envelope(document)
        const restaurant_id = document.restaurant._id ? document.restaurants._id : document.restaurant
        resource._links.restaurant = `/restaurants/${restaurant_id}`
        return resource
    }

    /**
     * Parametrize the query before it executes
     * @param query 
     */
    protected prepareOne(query: mongoose.DocumentQuery<Review, Review>): mongoose.DocumentQuery<Review, Review> {
        return query.populate('user', 'name email')
            .populate('restaurant', 'name')
    }

    /* findById = (request, response, next) => {
        this.model.findById(request.params.id)
            .populate('user', 'name email')
            .populate('restaurant', 'name')
            .then(this.render(response, next)).catch(next)
    } */

    applyRoutes(application: restify.Server) {

        /**
         * Returns a list of recordes
         * GET
         */
        application.get(`${this.basePath}`, this.findAll)

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

    }
}

export const reviewsRouter = new ReviewsRouter()
