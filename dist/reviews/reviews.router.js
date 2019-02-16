"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const reviews_model_1 = require("./reviews.model");
const authorization_handler_1 = require("../security/authorization.handler");
class ReviewsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(reviews_model_1.Review);
    }
    envelope(document) {
        let resource = super.envelope(document);
        const restaurant_id = document.restaurant._id ? document.restaurants._id : document.restaurant;
        resource._links.restaurant = `/restaurants/${restaurant_id}`;
        return resource;
    }
    /**
     * Parametrize the query before it executes
     * @param query
     */
    prepareOne(query) {
        return query.populate('user', 'name email')
            .populate('restaurant', 'name');
    }
    /* findById = (request, response, next) => {
        this.model.findById(request.params.id)
            .populate('user', 'name email')
            .populate('restaurant', 'name')
            .then(this.render(response, next)).catch(next)
    } */
    applyRoutes(application) {
        /**
         * Returns a list of recordes
         * GET
         */
        application.get(`${this.basePath}`, this.findAll);
        /**
         * Returns a recorder
         * GET
         * @param :id
         */
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        /**
         * Creates a new record
         * POST
         */
        application.post(`${this.basePath}`, [authorization_handler_1.authorize('user'), this.save]);
    }
}
exports.reviewsRouter = new ReviewsRouter();
