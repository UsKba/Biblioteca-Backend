import { Color, Role, User } from '@prisma/client';

export type UserWithColorAndRole = User & {
  color: Color;
  role: Role;
};
