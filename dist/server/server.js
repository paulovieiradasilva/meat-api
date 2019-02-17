"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const mongoose = require("mongoose");
const fs = require("fs");
const corsMiddleware = require("restify-cors-middleware");
const environment_1 = require("../common/environment");
const error_handler_1 = require("./error.handler");
const merge_patch_parser_1 = require("./merge-patch.parser");
const token_parser_1 = require("../security/token.parser");
const logger_1 = require("../common/logger");
class Server {
    initializeDb() {
        mongoose.Promise = global.Promise;
        return mongoose.connect(environment_1.environment.db.url, {
            useMongoClient: true
        });
    }
    initRoutes(routers) {
        return new Promise((resolve, reject) => {
            try {
                const options = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger_1.logger
                };
                if (environment_1.environment.security.enableHTTPS) {
                    options.certificate = fs.readFileSync(environment_1.environment.security.certificate),
                        options.key = fs.readFileSync(environment_1.environment.security.key);
                }
                this.application = restify.createServer(options);
                const corsOptions = {
                    preflightMaxAge: 10,
                    origins: ['*'],
                    allowHeaders: ['Autorization'],
                    exposeHeaders: ['x-custom-header']
                };
                const cors = corsMiddleware(corsOptions);
                /**
                 * Plugins
                 */
                this.application.pre(cors.preflight);
                this.application.pre(restify.plugins.requestLogger({ log: logger_1.logger }));
                this.application.use(cors.actual);
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(merge_patch_parser_1.mergePatchBodyParser);
                this.application.use(token_parser_1.tokenParser);
                /**
                 * Routes
                 */
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }
                /**
                 * Porta
                 */
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
                this.application.on('restifyError', error_handler_1.handleError);
                /* this.application.on('after', restify.plugins.auditLogger({
                    log: logger,
                    event: 'after'
                })) */
            }
            catch (error) {
                reject();
            }
        });
    }
    /**
     * Inicializa o servidor, banco de dados e carrega as rotas.
     */
    bootstrap(routers = []) {
        return this.initializeDb().then(() => this.initRoutes(routers).then(() => this));
    }
    shutdown() {
        return mongoose.disconnect().then(() => {
            this.application.close();
        });
    }
}
exports.Server = Server;
