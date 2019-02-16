"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const restify_errors_1 = require("restify-errors");
const restaurant_model_1 = require("./restaurant.model");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurant_model_1.Restaurant);
        /**
         * Return a list of restaurants menu
         */
        this.findMenu = (request, response, next) => {
            restaurant_model_1.Restaurant.findById(request.params.id, "+menu").then(restaurant => {
                if (!restaurant) {
                    throw new restify_errors_1.NotFoundError('Restaurante não encontrado');
                }
                else {
                    response.json(restaurant.menu);
                    return next();
                }
            }).catch(next);
        };
        /**
         * Updates a menu list of restaurants
         */
        this.replaceMenu = (request, response, next) => {
            restaurant_model_1.Restaurant.findById(request.params.id).then(restaurant => {
                if (!restaurant) {
                    throw new restify_errors_1.NotFoundError('Restaurante não encontrado');
                }
                else {
                    restaurant.menu = request.body; // Array de MenuItem.
                    return restaurant.save();
                }
            }).then(restaurant => {
                response.json(restaurant.menu);
                return next();
            }).catch(next);
        };
    }
    envelope(document) {
        let resource = super.envelope(document);
        resource._links.menu = `${this.basePath}/${resource._id}/menu`;
        return resource;
    }
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
        application.post(`${this.basePath}`, this.save);
        /**
         * Updates one record
         * PUT
         * @param :id
         */
        application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
        /**
         * Partially updates a record
         * PATCH
         * @param :id
         */
        application.patch(`${this.basePath}/:id`, [this.validateId, this.update]);
        /**
         * Delete a record
         * DELETE
         * @param :id
         */
        application.del(`${this.basePath}/:id`, [this.validateId, this.delete]);
        /**
         * Return a list of restaurants menu
         * GET
         * @param :id
         */
        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]);
        /**
         * Updates a menu list of restaurants
         * PUT
         * @param :id
         */
        application.put(`${this.basePath}/:id/menu`, [this.validateId, this.replaceMenu]);
    }
}
exports.restaurantsRouter = new RestaurantsRouter();
