import { Role } from '@prisma/client';

import { getRandomColor } from '~/app/utils/colors';
import { checkUserIsAdminByEnrollment, checkUserIsStudentByEnrollment } from '~/app/utils/user';

import userConfig from '~/config/user';

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
  role: Role;
}

interface CreateUserParams {
  enrollment: string;
  email: string;
  name: string;
}

async function getAdminRole() {
  const role = await prisma.role.findOne({
    where: {
      slug: userConfig.role.admin.slug,
    },
  });

  return role as Role;
}

async function getStudentRole() {
  const role = await prisma.role.findOne({
    where: {
      slug: userConfig.role.student.slug,
    },
  });

  return role as Role;
}

async function getRoleByEnrollment(enrollment: string) {
  const isAdmin = checkUserIsAdminByEnrollment(enrollment);
  const isStudent = checkUserIsStudentByEnrollment(enrollment);

  if (isStudent) {
    return getStudentRole();
  }

  if (isAdmin) {
    return getAdminRole();
  }

  throw new Error('Error getting role');
}

export async function createUser(params: CreateUserParams) {
  const { enrollment, email, name } = params;

  await assertUserNotExists({ enrollment });
  await assertUserNotExists({ email });

  const color = await getRandomColor();
  const role = await getRoleByEnrollment(enrollment);

  const user = await prisma.user.create({
    data: {
      enrollment,
      email,
      name,
      color: { connect: { id: color.id } },
      role: { connect: { id: role.id } },
    },
    include: {
      color: true,
      role: true,
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
    role: user.role.slug,
  };
}
