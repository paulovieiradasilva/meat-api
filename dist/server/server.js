"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const mongoose = require("mongoose");
const environment_1 = require("../common/environment");
const error_handler_1 = require("./error.handler");
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
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                });
                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                /**
                 * Routes
                 */
                for (let router of routers) {
                    router.applyRoutes(this.application);
                }
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
                this.application.on('restifyError', error_handler_1.handleError);
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