import prisma from '~/prisma';

interface UserData {
  name: string;
  email: string;
  enrollment: string;
}

export async function findUserOrCreate(userData: UserData) {
  const { enrollment, name, email } = userData;

  const users = await prisma.users.findMany({
    where: { enrollment, email },
  });

  if (users.length > 0) {
    return users[0];
  }

  const user = await prisma.users.create({
    data: {
      enrollment,
      email,
      name,
    },
  });

  return user;
}
