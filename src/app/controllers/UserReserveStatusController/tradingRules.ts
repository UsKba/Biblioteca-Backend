import { Reserve, UserReserve } from '@prisma/client';

import reserveConfig from '~/config/reserve';

type Params = Reserve & {
  UserReserve: UserReserve[];
};

export function checkHaveTheMinimumRequiredUsersThatNotRefused(reserve: Params) {
  const usersRefusedCount = reserve.UserReserve.reduce((count, userReserve) => {
    if (userReserve.status === reserveConfig.userReserve.statusRefused) {
      return count + 1;
    }

    return count;
  }, 0);

  const countOfUsersThatRefusedOrWill = usersRefusedCount + 1;
  const haveMinimumRequired =
    reserve.UserReserve.length - countOfUsersThatRefusedOrWill >= reserveConfig.minClassmatesPerRoom;

  return haveMinimumRequired;
}

export function assertUserAlreadyNotRefusedReserve(userId: number, reserve: Params) {
  const [userReserve] = reserve.UserReserve.filter((currentUserReserve) => currentUserReserve.userId === userId);

  if (userReserve.status === reserveConfig.userReserve.statusRefused) {
    throw new Error('O usuário já não faz parte dessa reserva');
  }
}
