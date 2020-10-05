import { Router } from 'express';

import FriendController from '~/app/controllers/FriendController';
import InviteConfirmationController from '~/app/controllers/InviteConfirmationController';
import InviteController from '~/app/controllers/InviteController';
import LoginController from '~/app/controllers/LoginController';
import PeriodController from '~/app/controllers/PeriodController';
import ReserveController from '~/app/controllers/ReserveController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import SeachController from '~/app/controllers/SeachController';
import UserController from '~/app/controllers/UserController';
import UserReserverController from '~/app/controllers/UserReserverController';

import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateInviteStore } from '~/app/validations/invite';
import { validateLoginStore } from '~/app/validations/login';
import { validateReserveStore } from '~/app/validations/reserve';
import { validateRoomStore, validateRoomUpdate } from '~/app/validations/room';
import { validateScheduleStore, validateScheduleUpdate } from '~/app/validations/schedule';
import { validateSeachShow } from '~/app/validations/search';
import { validateUserStore, validateUserUpdate } from '~/app/validations/user';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({ ok: true });
});

routes.post('/login', validateLoginStore, LoginController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users/:id', validateParamsId, validateUserUpdate, UserController.update);

routes.get('/rooms', RoomController.index);
routes.post('/rooms', validateRoomStore, RoomController.store);
routes.put('/rooms/:id', validateParamsId, validateRoomUpdate, RoomController.update);
routes.delete('/rooms/:id', validateParamsId, RoomController.delete);

routes.get('/schedules', ScheduleController.index);
routes.post('/schedules', validateScheduleStore, ScheduleController.store);
routes.put('/schedules/:id', validateParamsId, validateScheduleUpdate, ScheduleController.update);
routes.delete('/schedules/', ScheduleController.deleteAll);

routes.get('/periods', PeriodController.index);
routes.post('/periods', PeriodController.store);

// Privada

routes.use(authMiddleware);

routes.get('/reserves', ReserveController.index);
routes.post('/reserves', validateReserveStore, ReserveController.store);
routes.delete('/reserves', ReserveController.deleteAll);

routes.get('/userReserves', UserReserverController.index);
routes.delete('/userReserves', UserReserverController.deleteAll);

routes.get('/friends', FriendController.index);

routes.get('/invites', InviteController.index);
routes.post('/invites', validateInviteStore, InviteController.store);
routes.delete('/invites/:id', validateParamsId, InviteController.delete);

routes.get('/invites/pending', InviteController.indexPending);
routes.post('/invites/confirmation', InviteConfirmationController.store);

routes.get('/search/:enrollment', validateSeachShow, SeachController.show);

export default routes;
