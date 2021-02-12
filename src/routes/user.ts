import { Router } from 'express';

import FriendController from '~/app/controllers/FriendController';
import FriendRequestConfirmationController from '~/app/controllers/FriendRequestConfirmationController';
import FriendRequestController from '~/app/controllers/FriendRequestController';
import ReserveController from '~/app/controllers/ReserveController';
import SearchController from '~/app/controllers/SearchController';
import UserReserveController from '~/app/controllers/UserReserveController';
import UserReserveStatusController from '~/app/controllers/UserReserveStatusController';

import authMiddleware from '~/app/middlewares/auth';

import { validateParamsId } from '~/app/validations';
import { validateFriendRequestStore } from '~/app/validations/friendRequest';
import { validateReserveStore } from '~/app/validations/reserve';
import { validateSeachIndex } from '~/app/validations/search';
import { validateReserveDeleteParams } from '~/app/validations/userReserve';
import { validateUserReserveStatusPostParams } from '~/app/validations/userReserveStatus';

const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.get('/friends/request', FriendRequestController.index);
userRoutes.post('/friends/request', validateFriendRequestStore, FriendRequestController.store);
userRoutes.delete('/friends/request/:id', validateParamsId, FriendRequestController.delete);

userRoutes.post('/friends/request/confirmation', FriendRequestConfirmationController.store);

userRoutes.get('/friends', FriendController.index);
userRoutes.delete('/friends/:id', validateParamsId, FriendController.delete);

userRoutes.get('/reserves', ReserveController.index);
userRoutes.post('/reserves', validateReserveStore, ReserveController.store);
userRoutes.delete('/reserves/:id', validateParamsId, ReserveController.delete);

userRoutes.delete('/reserves/:reserveId/users/:userId', validateReserveDeleteParams, UserReserveController.delete);

userRoutes.post('/reserves/:reserveId/accept', validateUserReserveStatusPostParams, UserReserveStatusController.accept);
userRoutes.post('/reserves/:reserveId/refuse', validateUserReserveStatusPostParams, UserReserveStatusController.refuse);

userRoutes.get('/search', validateSeachIndex, SearchController.index);

export default userRoutes;
