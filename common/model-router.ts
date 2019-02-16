import { Router } from './router'
import * as mongoose from 'mongoose'
import { NotFoundError } from 'restify-errors';


export abstract class ModelRouter<D extends mongoose.Document> extends Router {

    basePath: string
    pageSize: number = 4

    constructor(protected model: mongoose.Model<D>) {
        super()
        this.basePath = `/${model.collection.name}`
    }

    /**
     * Parametrize the query before it executes
     * allows to pass other parameters to the query
     * @param query 
     */
    protected prepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
        return query
    }

    public envelope(document: any): any {
        let resource = Object.assign({ _links: {} }, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`
        return resource
    }

    public envelopeAll(documents: any[], options: any = {}): any {
        const resource: any = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        }
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`
            }
            const remaining = options.count - (options.page * options.pageSize)
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`
            }
        }
        return resource
    }

    public validateId = (request, response, next) => {
        if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
            next(new NotFoundError('Documento não encontrado'))
        } else {
            next()
        }
    }

    public findAll = (request, response, next) => {
        let page = parseInt(request.query._page || 1)
        page = page > 0 ? page : 1
        const skip = (page - 1) * this.pageSize

        this.model
            .count({}).exec()
            .then(count => this.model.find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(response, next, { page, count, pageSize: this.pageSize, url: request.url })))
            .catch(next)
    }

    public findById = (request, response, next) => {
        this.prepareOne(this.model.findById(request.params.id)).then(this.render(response, next)).catch(next)
    }

    public save = (request, response, next) => {
        let document = new this.model(request.body)
        document.save().then(this.render(response, next)).catch(next)
    }

    public replace = (req, resp, next) => {
        const options = { runValidator: true, overwrite: true }
        this.model.update({ _id: req.params.id }, req.body, options).exec().then(result => {
            if (result.n) {
                return this.model.findById(req.params.id).exec()
            } else {
                throw new NotFoundError('Documento não encontrado')
            }
        }).then(this.render(resp, next)).catch(next)
    }

    public update = (request, response, next) => {
        const options = { runValidator: true, new: true }
        this.model.findByIdAndUpdate(request.params.id, request.body, options).then(this.render(response, next)).catch(next)
    }

    public delete = (request, response, next) => {
        this.model.remove({ _id: request.params.id }).exec().then((cmdResult: any) => {
            if (cmdResult.result.n) {
                response.send(204)
            } else {
                throw new NotFoundError('Documento não encontrado')
            }
            return next()
        }).catch(next)
    }
}