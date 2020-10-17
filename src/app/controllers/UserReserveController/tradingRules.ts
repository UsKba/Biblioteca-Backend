import { UserReserve } from '@prisma/client';

import reserveConfig from '~/config/reserve';

export function assertUserIsOnReserve(userId: number, userReserves: UserReserve[]) {
  const userExists = userReserves.find((userReserve) => userReserve.userId === userId);

  if (!userExists) {
    throw new Error('Não se pode remover um usuário que não está na reserva');
  }
}

export function assertCanRemoveUserFromReserve(userReserves: UserReserve[]) {
  if (userReserves.length - 1 < reserveConfig.minClassmatesPerRoom) {
    throw new Error(`Precisa-se ter no mínimo ${reserveConfig.minClassmatesPerRoom} componentes na reserva`);
  }
}
