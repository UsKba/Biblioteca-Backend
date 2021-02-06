import { Router } from 'express';

import AllReserves from '~/app/controllers/AllReserves';
import FriendController from '~/app/controllers/FriendController';
import FriendRequestConfirmationController from '~/app/controllers/FriendRequestConfirmationController';
import FriendRequestController from '~/app/controllers/FriendRequestController';
import LoginController from '~/app/controllers/LoginController';
import PeriodController from '~/app/controllers/PeriodController';
import ReserveController from '~/app/controllers/ReserveController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import SearchController from '~/app/controllers/SearchController';
import UserController from '~/app/controllers/UserController';
import UserReserveController from '~/app/controllers/UserReserveController';
import UserReserveStatusController from '~/app/controllers/UserReserveStatusController';

import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateFriendRequestStore } from '~/app/validations/friendRequest';
import { validateLoginStore } from '~/app/validations/login';
import { validatePeriodStore } from '~/app/validations/period';
import { validateReserveStore } from '~/app/validations/reserve';
import { validateRoomStore, validateRoomUpdate } from '~/app/validations/room';
import { validateScheduleStore, validateScheduleUpdate } from '~/app/validations/schedule';
import { validateSeachIndex } from '~/app/validations/search';
import { validateUserStore, validateUserUpdate } from '~/app/validations/user';
import { validateReserveDeleteParams } from '~/app/validations/userReserve';
import { validateUserReserveStatusPostParams } from '~/app/validations/userReserveStatus';

import NoticeController from './app/controllers/NoticeController';

const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ ok: true });
});

routes.post('/login', validateLoginStore, LoginController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users/:id', validateParamsId, validateUserUpdate, UserController.update);

// routes.get('/tags', TagController.index);

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

routes.get('/reserves/all', AllReserves.index);

// Usuário Privada

routes.use(authMiddleware);

routes.get('/friends/request', FriendRequestController.index);
routes.post('/friends/request', validateFriendRequestStore, FriendRequestController.store);
routes.delete('/friends/request/:id', validateParamsId, FriendRequestController.delete);

routes.post('/friends/request/confirmation', FriendRequestConfirmationController.store);

routes.get('/friends', FriendController.index);
routes.delete('/friends/:id', validateParamsId, FriendController.delete);

routes.get('/reserves', ReserveController.index);
routes.post('/reserves', validateReserveStore, ReserveController.store);
routes.delete('/reserves/:id', validateParamsId, ReserveController.delete);

routes.delete('/reserves/:reserveId/users/:userId', validateReserveDeleteParams, UserReserveController.delete);

routes.post('/reserves/:reserveId/accept', validateUserReserveStatusPostParams, UserReserveStatusController.accept);
routes.post('/reserves/:reserveId/refuse', validateUserReserveStatusPostParams, UserReserveStatusController.refuse);

routes.get('/search', validateSeachIndex, SearchController.index);

// Admin

routes.post('/notices', NoticeController.store);

// routes.get('/messages', MessagesController.index);
// routes.post('/messages', validateMessageStore, MessagesController.store);

export default routes;
