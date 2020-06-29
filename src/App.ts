import express, { Express } from 'express';
import routes from './routes';

import routeValidation from '~/app/middlewares/routeValidation';

class App {
  server: Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    // this.server.use(routeValidation);
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
