import { getRandomColor } from '~/app/utils/colors';

import prisma from '~/prisma';

import { assertUserNotExists } from './tradingRules';

interface UserToFormat {
  id: number;
  enrollment: string;
  email: string;
  name: string;
  color: {
    color: string;
  };
}

interface CreateUserParams {
  enrollment: string;
  email: string;
  name: string;
}

export async function createUser(params: CreateUserParams) {
  const { enrollment, email, name } = params;

  await assertUserNotExists({ enrollment });
  await assertUserNotExists({ email });

  const color = await getRandomColor();

  const user = await prisma.user.create({
    data: {
      enrollment,
      email,
      name,
      color: { connect: { id: color.id } },
    },
    include: {
      color: true,
    },
  });

  return user;
}

export function formatUserToResponse(user: UserToFormat) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    enrollment: user.enrollment,
    color: user.color.color,
  };
}
