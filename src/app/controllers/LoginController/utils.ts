import prisma from '~/prisma';

import { createUser } from '../UserController/utils';

interface UserData {
  name: string;
  email: string;
  enrollment: string;
}

export async function findUserOrCreate(userData: UserData) {
  const { enrollment, name, email } = userData;

  const users = await prisma.user.findMany({
    where: { enrollment, email },
    include: { color: true, role: true },
  });

  if (users.length > 0) {
    return users[0];
  }

  const user = await createUser({ enrollment, name, email });

  return user;
}
