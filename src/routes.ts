import { Router } from 'express';

import ReserveController from '~/app/controllers/ReserveController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import SessionController from '~/app/controllers/SessionController';
import UserController from '~/app/controllers/UserController';

import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateScheduleStore, validateScheduleUpdate } from '~/app/validations/schedule';
import { validateUserStore, validateUserUpdate } from '~/app/validations/user';

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

routes.post('/schedules', validateScheduleStore, ScheduleController.store);
routes.get('/schedules', ScheduleController.index);
routes.put('/schedules/:id', validateScheduleUpdate, validateParamsId, ScheduleController.update);
routes.delete('/schedules/', ScheduleController.delete);

// Privada

routes.use(authMiddleware);

routes.get('/reserves', ReserveController.index);
routes.post('/reserves', ReserveController.store);

export default routes;
