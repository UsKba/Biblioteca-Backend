import { Router } from 'express';

import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import SessionController from '~/app/controllers/SessionController';
import UserController from '~/app/controllers/UserController';

import authMiddleware from '~/app/middlewares/auth';

import { validateUserStore, validateUserUpdate } from '~/app/validations/user';

import ReserveController from './app/controllers/ReserveController';
import { validateParamsId } from './app/validations';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({ ok: true });
});

routes.post('/sessions', SessionController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users', validateUserUpdate, UserController.update);

routes.post('/rooms', RoomController.store);
routes.get('/rooms', RoomController.index);
routes.put('/rooms/:id', validateParamsId, RoomController.update);
routes.delete('/rooms/:id', validateParamsId, RoomController.delete);

routes.post('/schedules', ScheduleController.store);
routes.get('/schedules', ScheduleController.index);
routes.put('/schedules/:id', validateParamsId, ScheduleController.update);
routes.delete('/schedules/', ScheduleController.delete);

// Privada

routes.use(authMiddleware);

routes.post('/reserve', ReserveController.store);

export default routes;
