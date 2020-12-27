import { getNextUserColor } from '~/app/utils/colors';

import prisma from '~/prisma';

interface UserData {
  name: string;
  email: string;
  enrollment: string;
}

export async function findUserOrCreate(userData: UserData) {
  const { enrollment, name, email } = userData;

  const users = await prisma.user.findMany({
    where: { enrollment, email },
  });

  if (users.length > 0) {
    return users[0];
  }

  const color = getNextUserColor();

  const user = await prisma.user.create({
    data: {
      enrollment,
      email,
      name,
      color,
    },
  });

  return user;
}
