import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as fs from 'fs'
import * as corsMiddleware from 'restify-cors-middleware'
import { environment } from '../common/environment';
import { Router } from '../common/router';
import { handleError } from './error.handler';
import { mergePatchBodyParser } from './merge-patch.parser';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';


export class Server {

    application: restify.Server

    initializeDb(): mongoose.MongooseThenable {
        (<any>mongoose).Promise = global.Promise
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    initRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {

                const options: restify.ServerOptions = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger
                }
                if (environment.security.enableHTTPS) {
                    options.certificate = fs.readFileSync(environment.security.certificate),
                        options.key = fs.readFileSync(environment.security.key)
                }
                this.application = restify.createServer(options)

                const corsOptions: corsMiddleware.Options = {
                    preflightMaxAge: 10,
                    origins: ['*'],
                    allowHeaders: ['Autorization'],
                    exposeHeaders: ['x-custom-header']
                }

                const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions)

                /**
                 * Plugins
                 */
                this.application.pre(cors.preflight)
                this.application.pre(restify.plugins.requestLogger({ log: logger }))

                this.application.use(cors.actual)
                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(mergePatchBodyParser)
                this.application.use(tokenParser)

                /**
                 * Routes
                 */
                for (let router of routers) {
                    router.applyRoutes(this.application)
                }

                /**
                 * Porta
                 */
                this.application.listen(environment.server.port, () => {
                    resolve(this.application)
                })

                this.application.on('restifyError', handleError)

                /* this.application.on('after', restify.plugins.auditLogger({
                    log: logger,
                    event: 'after'
                })) */

            } catch (error) {
                reject()
            }
        })
    }

    /**
     * Inicializa o servidor, banco de dados e carrega as rotas.
     */
    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDb().then(() => this.initRoutes(routers).then(() => this))
    }

    shutdown() {
        return mongoose.disconnect().then(() => {
            this.application.close()
        })
    }
}