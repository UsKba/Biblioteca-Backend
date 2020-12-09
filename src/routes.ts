import { Router } from 'express';

import FriendController from '~/app/controllers/FriendController';
import InviteConfirmationController from '~/app/controllers/InviteConfirmationController';
import InviteController from '~/app/controllers/InviteController';
import LoginController from '~/app/controllers/LoginController';
import PeriodController from '~/app/controllers/PeriodController';
import ReserveController from '~/app/controllers/ReserveController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import SearchController from '~/app/controllers/SearchController';
import UserController from '~/app/controllers/UserController';
import UserReserveController from '~/app/controllers/UserReserveController';
import WeekReserve from '~/app/controllers/WeekReserve';

import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateInviteStore } from '~/app/validations/invite';
import { validateLoginStore } from '~/app/validations/login';
import { validatePeriodStore } from '~/app/validations/period';
import { validateReserveStore } from '~/app/validations/reserve';
import { validateRoomStore, validateRoomUpdate } from '~/app/validations/room';
import { validateScheduleStore, validateScheduleUpdate } from '~/app/validations/schedule';
import { validateSeachIndex } from '~/app/validations/search';
import { validateUserStore, validateUserUpdate } from '~/app/validations/user';
import { validateReserveDeleteParams } from '~/app/validations/userReserve';

const routes = Router();

routes.get('/', (request, response) => {
  return response.json({ ok: true });
});

routes.post('/login', validateLoginStore, LoginController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users/:id', validateParamsId, validateUserUpdate, UserController.update);

// Admin

routes.get('/rooms', RoomController.index);
routes.post('/rooms', validateRoomStore, RoomController.store);
routes.put('/rooms/:id', validateParamsId, validateRoomUpdate, RoomController.update);
routes.delete('/rooms/:id', validateParamsId, RoomController.delete);

routes.get('/schedules', ScheduleController.index);
routes.post('/schedules', validateScheduleStore, ScheduleController.store);
routes.put('/schedules/:id', validateParamsId, validateScheduleUpdate, ScheduleController.update);

routes.get('/periods', PeriodController.index);
routes.post('/periods', validatePeriodStore, PeriodController.store);

routes.get('/reserves/week', WeekReserve.index);

// Usuário Privada

routes.use(authMiddleware);

routes.get('/invites', InviteController.index);
routes.post('/invites', validateInviteStore, InviteController.store);
routes.delete('/invites/:id', validateParamsId, InviteController.delete);

routes.get('/invites/pending', InviteController.indexPending);
routes.post('/invites/confirmation', InviteConfirmationController.store);

routes.get('/friends', FriendController.index);

routes.get('/reserves', ReserveController.index);
routes.post('/reserves', validateReserveStore, ReserveController.store);
routes.delete('/reserves/:id', validateParamsId, ReserveController.delete);

routes.delete('/reserves/:reserveId/users/:userId', validateReserveDeleteParams, UserReserveController.delete);

routes.get('/search', validateSeachIndex, SearchController.index);

export default routes;
