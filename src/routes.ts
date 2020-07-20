import { Router } from 'express';

import SessionController from '~/app/controllers/SessionController';
import UserController from '~/app/controllers/UserController';

import authMiddleware from '~/app/middlewares/auth';

import { validateUserStore, validateUserShow, validateUserUpdate } from '~/app/validations/user';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({});
});

routes.post('/sessions', SessionController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateUserShow, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users', validateUserUpdate, UserController.update);

// Privada

routes.use(authMiddleware);

routes.post('/reserve', (request, response) => {
  console.log('request.userEnrollement');
  console.log(request.userEnrollment);

  return response.json({ message: 'FOI' });
});

export default routes;
