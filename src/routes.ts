import { Router } from 'express';

import RoomController from '~/app/controllers/RoomController';
import SessionController from '~/app/controllers/SessionController';
import UserController from '~/app/controllers/UserController';

import authMiddleware from '~/app/middlewares/auth';

import { validateUserStore, validateUserUpdate } from '~/app/validations/user';

import ReserveController from './app/controllers/ReserveController';
import { validateParamsId } from './app/validations';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({});
});

routes.post('/sessions', SessionController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users', validateUserUpdate, UserController.update);

routes.post('/room', RoomController.store);
routes.get('/room', RoomController.index);
routes.put('/room/:id', validateParamsId, RoomController.update);

// Privada

routes.use(authMiddleware);

routes.post('/reserve', ReserveController.store);

export default routes;

// CRUD de Rooms
// Validacoes em todas as rotas
// Lembrae de fazer o `show`
