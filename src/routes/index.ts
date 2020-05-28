import { Router } from 'express';
import UserController from '../app/controllers/UserController';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({});
});

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

export default routes;
