import { Color, User } from '@prisma/client';

export type UserWithColor = User & { color: Color };
