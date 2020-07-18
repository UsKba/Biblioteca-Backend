import { Router } from 'express';

import UserController from '~/app/controllers/UserController';

import { validateUserStore } from '~/app/validations/user';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({});
});

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users', UserController.update);

export default routes;
