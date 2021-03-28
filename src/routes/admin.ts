import { Router } from 'express';

import ComputersController from '~/app/controllers/ComputersController';
import NoticeController from '~/app/controllers/NoticeController';
import PeriodController from '~/app/controllers/PeriodController';
import RoomController from '~/app/controllers/RoomController';
import ScheduleController from '~/app/controllers/ScheduleController';

import { validateParamsId } from '~/app/validations';
import { validateComputersStore, validateComputersUpdate } from '~/app/validations/computer';
import { validateNoticeStore } from '~/app/validations/notice';
import { validatePeriodStore } from '~/app/validations/period';
import { validateRoomStore, validateRoomUpdate } from '~/app/validations/room';
import { validateScheduleStore, validateScheduleUpdate } from '~/app/validations/schedule';

const adminRoutes = Router();

adminRoutes.post('/periods', validatePeriodStore, PeriodController.store);

adminRoutes.post('/schedules', validateScheduleStore, ScheduleController.store);
adminRoutes.put('/schedules/:id', validateParamsId, validateScheduleUpdate, ScheduleController.update);

adminRoutes.post('/rooms', validateRoomStore, RoomController.store);
adminRoutes.put('/rooms/:id', validateParamsId, validateRoomUpdate, RoomController.update);
adminRoutes.delete('/rooms/:id', validateParamsId, RoomController.delete);

adminRoutes.post('/computers', validateComputersStore, ComputersController.store);
adminRoutes.delete('/computers/:id', validateParamsId, ComputersController.delete);
adminRoutes.put('/computers/:id', validateParamsId, validateComputersUpdate, ComputersController.update);

adminRoutes.post('/notices', validateNoticeStore, NoticeController.store);
adminRoutes.delete('/notices/:id', validateParamsId, NoticeController.delete);

// adminRoutes.post('/messages', validateMessageStore, MessagesController.store);

export default adminRoutes;
