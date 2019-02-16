"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestCli = require("jest-cli");
const server_1 = require("./server/server");
const environment_1 = require("./common/environment");
const users_model_1 = require("./users/users.model");
const reviews_model_1 = require("./reviews/reviews.model");
const restaurant_model_1 = require("./restaurants/restaurant.model");
const users_router_1 = require("./users/users.router");
const reviews_router_1 = require("./reviews/reviews.router");
const restaurant_router_1 = require("./restaurants/restaurant.router");
let server;
const beforeAllTestes = () => {
    environment_1.environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db';
    environment_1.environment.server.port = process.env.SERVER_PORT || 3001;
    server = new server_1.Server();
    return server.bootstrap([
        users_router_1.usersRouter,
        reviews_router_1.reviewsRouter,
        restaurant_router_1.restaurantsRouter
    ])
        .then(() => users_model_1.User.remove({}).exec())
        .then(() => reviews_model_1.Review.remove({}).exec())
        .then(() => restaurant_model_1.Restaurant.remove({}).exec());
};
const afterAllTestes = () => { return server.shutdown(); };
beforeAllTestes()
    .then(() => jestCli.run())
    .then(() => afterAllTestes())
    .catch(console.error);
