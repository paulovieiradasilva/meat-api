"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 4;
        this.validateId = (request, response, next) => {
            if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
                next(new restify_errors_1.NotFoundError('Documento não encontrado'));
            }
            else {
                next();
            }
        };
        this.findAll = (request, response, next) => {
            let page = parseInt(request.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * this.pageSize;
            this.model
                .count({}).exec()
                .then(count => this.model.find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(response, next, { page, count, pageSize: this.pageSize, url: request.url })))
                .catch(next);
        };
        this.findById = (request, response, next) => {
            this.prepareOne(this.model.findById(request.params.id)).then(this.render(response, next)).catch(next);
        };
        this.save = (request, response, next) => {
            let document = new this.model(request.body);
            document.save().then(this.render(response, next)).catch(next);
        };
        this.replace = (req, resp, next) => {
            const options = { runValidator: true, overwrite: true };
            this.model.update({ _id: req.params.id }, req.body, options).exec().then(result => {
                if (result.n) {
                    return this.model.findById(req.params.id).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado');
                }
            }).then(this.render(resp, next)).catch(next);
        };
        this.update = (request, response, next) => {
            const options = { runValidator: true, new: true };
            this.model.findByIdAndUpdate(request.params.id, request.body, options).then(this.render(response, next)).catch(next);
        };
        this.delete = (request, response, next) => {
            this.model.remove({ _id: request.params.id }).exec().then((cmdResult) => {
                if (cmdResult.result.n) {
                    response.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado');
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    /**
     * Parametrize the query before it executes
     * allows to pass other parameters to the query
     * @param query
     */
    prepareOne(query) {
        return query;
    }
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    envelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
            }
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
