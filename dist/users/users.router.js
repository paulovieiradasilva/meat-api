"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("../common/model-router");
const users_model_1 = require("./users.model");
const authentication_handler_1 = require("../security/authentication.handler");
const authorization_handler_1 = require("../security/authorization.handler");
class UsersRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        this.findBayEmail = (request, response, next) => {
            if (request.query.email) {
                users_model_1.User.findByEmail(request.query.email)
                    .then(user => user ? [user] : [])
                    .then(this.renderAll(response, next, {
                    pageSize: this.pageSize,
                    url: request.url
                })).catch(next);
            }
            else {
                next();
            }
        };
        this.on('beforeRender', document => {
            document.password = undefined;
            //delete document.password
        });
    }
    applyRoutes(application) {
        /**
         * Returns a list of recordes
         * GET
         */
        application.get({ path: `${this.basePath}`, version: '1.0.0' }, [authorization_handler_1.authorize('admin'), this.findAll]);
        application.get({ path: `${this.basePath}`, version: '2.0.0' }, [authorization_handler_1.authorize('admin'), this.findBayEmail, this.findAll]);
        /**
         * Returns a recorder
         * GET
         * @param :id
         */
        application.get(`${this.basePath}/:id`, [authorization_handler_1.authorize('admin'), this.validateId, this.findById]);
        /**
         * Creates a new record
         * POST
         */
        application.post(`${this.basePath}`, [authorization_handler_1.authorize('admin'), this.save]);
        /**
         * Updates one record
         * PUT
         * @param :id
         */
        application.put(`${this.basePath}/:id`, [authorization_handler_1.authorize('admin'), this.validateId, this.replace]);
        /**
         * Partially updates a record
         * PATCH
         * @param :id
         */
        application.patch(`${this.basePath}/:id`, [authorization_handler_1.authorize('admin'), this.validateId, this.update]);
        /**
         * Delete a record
         * DELETE
         * @param :id
         */
        application.del(`${this.basePath}/:id`, [authorization_handler_1.authorize('admin'), this.validateId, this.delete]);
        application.post(`${this.basePath}/authenticate`, authentication_handler_1.authenticate);
    }
}
exports.usersRouter = new UsersRouter();
