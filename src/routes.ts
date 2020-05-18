import { Router } from 'express';
import UserController from './UserController';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({ user: 'Kadu' });
});

routes.get('/users', UserController.index);
routes.post('/users', UserController.create);
routes.put('/users', UserController.update);
routes.get('/users/:id', UserController.getUserById);

export default routes;
