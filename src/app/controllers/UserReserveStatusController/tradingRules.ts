import { Reserve, UserReserve } from '@prisma/client';
import { isBefore } from 'date-fns';

import { removeDateTimezoneOffset } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

type Params = Reserve & {
  userReserve: UserReserve[];
};

export function checkHaveTheMinimumRequiredUsersThatNotRefused(reserve: Params) {
  const usersRefusedCount = reserve.userReserve.reduce((count, userReserve) => {
    if (userReserve.status === reserveConfig.userReserve.statusRefused) {
      return count + 1;
    }

    return count;
  }, 0);

  const countOfUsersThatRefusedOrWill = usersRefusedCount + 1;
  const haveMinimumRequired =
    reserve.userReserve.length - countOfUsersThatRefusedOrWill >= reserveConfig.minClassmatesPerRoom;

  return haveMinimumRequired;
}

export function assertUserAlreadyNotRefusedReserve(userId: number, reserve: Params) {
  const [userReserve] = reserve.userReserve.filter((currentUserReserve) => currentUserReserve.userId === userId);

  if (userReserve.status === reserveConfig.userReserve.statusRefused) {
    throw new Error('O usuário já não faz parte dessa reserva');
  }
}

export function assertNowIsBeforeOfReserve(reserve: Reserve) {
  const now = new Date();
  const reserveDate = new Date(reserve.date);

  const nowWithoutTimezone = removeDateTimezoneOffset(now);
  const reserveDateWithoutTimezone = removeDateTimezoneOffset(reserveDate);

  const isNowBefore = isBefore(nowWithoutTimezone, reserveDateWithoutTimezone);

  if (!isNowBefore) {
    throw new Error('Você está atrasado para fazer isso');
  }
}
