import { getRandomColor } from '~/app/utils/colors';

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
    include: { color: true },
  });

  if (users.length > 0) {
    return users[0];
  }

  const color = await getRandomColor();

  const user = await prisma.user.create({
    data: {
      enrollment,
      email,
      name,
      color: { connect: { id: color.id } },
    },
    include: { color: true },
  });

  return user;
}
