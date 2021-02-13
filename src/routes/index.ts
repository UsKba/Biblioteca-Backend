import { Router } from 'express';

import AllReserves from '~/app/controllers/AllReserves';
import ComputersController from '~/app/controllers/ComputersController';
import LoginController from '~/app/controllers/LoginController';
import NoticeController from '~/app/controllers/NoticeController';
import PeriodController from '~/app/controllers/PeriodController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';
import UserController from '~/app/controllers/UserController';

import adminMiddleware from '~/app/middlewares/admin';
import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateLoginStore } from '~/app/validations/login';
import { validateUserStore, validateUserUpdate } from '~/app/validations/user';

import adminRoutes from './admin';
import userRoutes from './user';

const routes = Router();

routes.get('/', (req, res) => res.json({ ok: true }));

routes.post('/login', validateLoginStore, LoginController.store);

routes.get('/users', UserController.index);
routes.get('/users/:id', validateParamsId, UserController.show);
routes.post('/users', validateUserStore, UserController.store);
routes.put('/users/:id', validateParamsId, validateUserUpdate, UserController.update);

routes.get('/rooms', RoomController.index);
routes.get('/schedules', ScheduleController.index);
routes.get('/periods', PeriodController.index);
routes.get('/computers/:id', ComputersController.index);

routes.get('/reserves/all', AllReserves.index);
routes.get('/notices', NoticeController.index);

// routes.get('/messages', MessagesController.index);
// routes.get('/tags', TagController.index);

routes.use(authMiddleware);
routes.use(userRoutes);
routes.get('/test/auth', (req, res) => res.sendStatus(200)); // for tests

routes.use(adminMiddleware);
routes.use(adminRoutes);
routes.get('/test/auth/admin', (req, res) => res.sendStatus(200)); // for tests

export default routes;
