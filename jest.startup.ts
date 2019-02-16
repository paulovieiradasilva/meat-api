import * as jestCli from 'jest-cli'

import { Server } from "./server/server";
import { environment } from "./common/environment";
import { User } from "./users/users.model";
import { Review } from "./reviews/reviews.model";
import { Restaurant } from './restaurants/restaurant.model';
import { usersRouter } from "./users/users.router";
import { reviewsRouter } from "./reviews/reviews.router";
import { restaurantsRouter } from './restaurants/restaurant.router';

let server: Server

const beforeAllTestes = () => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    server = new Server()
    return server.bootstrap(
        [
            usersRouter,
            reviewsRouter,
            restaurantsRouter
        ])
        .then(() => User.remove({}).exec())
        .then(() => Review.remove({}).exec())
        .then(() => Restaurant.remove({}).exec())
}

const afterAllTestes = () => { return server.shutdown() }

beforeAllTestes()
    .then(() => jestCli.run())
    .then(() => afterAllTestes())
    .catch(console.error)