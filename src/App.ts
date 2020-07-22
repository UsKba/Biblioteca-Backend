import './bootstrap';

import express, { Express } from 'express';

import routes from './routes';

class App {
  server: Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
// Kaduco19
// caduco2003@gmail.com
// Co-authored-by: Kaduco19 <caduco2003@gmail.com>"
