import { Reserve, UserReserve } from '@prisma/client';
import { isBefore } from 'date-fns';

import { getDateOnBrazilTimezone, removeDateTimezoneOffset } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

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
    throw new RequestError('O usuário já não faz parte dessa reserva');
  }
}

export function assertUserAlreadyNotAcceptedReserve(userId: number, reserve: Params) {
  const [userReserve] = reserve.userReserve.filter((currentUserReserve) => currentUserReserve.userId === userId);

  if (userReserve.status === reserveConfig.userReserve.statusAccepted) {
    throw new RequestError('O usuário já está participando participando da reserva');
  }
}

export function assertNowIsBeforeOfReserve(reserve: Reserve) {
  const now = new Date();
  const reserveDate = new Date(reserve.date);

  const nowOnBrazilTimezone = getDateOnBrazilTimezone(now);
  const reserveDateOnBrazilTimezone = removeDateTimezoneOffset(reserveDate); // already on brazil timezone

  const isNowBefore = isBefore(nowOnBrazilTimezone, reserveDateOnBrazilTimezone);

  if (!isNowBefore) {
    throw new RequestError('Você está atrasado para fazer isso');
  }
}
