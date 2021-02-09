import { Response } from 'express';

import { RequestAuthQuery } from '~/types/requestAuth';

import prisma from '~/prisma';

import { formatUserToResponse } from '../UserController/utils';

type ShowSearch = {
  name?: string;
  enrollment?: string;
  email?: string;

  skip?: string;
  limit?: string;
};

type ShowRequest = RequestAuthQuery<ShowSearch>;

class SeachController {
  async index(req: ShowRequest, res: Response) {
    const { name, email, enrollment, skip, limit } = req.query;

    const skipNumber = skip === undefined ? undefined : Number(skip);
    const limitNumber = limit === undefined ? undefined : Number(limit);

    const users = await prisma.user.findMany({
      where: {
        name: { contains: name },
        enrollment: { contains: enrollment },
        email: { contains: email },
      },
      include: {
        color: true,
        role: true,
      },
      skip: skipNumber,
      take: limitNumber,
    });

    const usersFormatted = users.map(formatUserToResponse);

    return res.json(usersFormatted);
  }
}

export default new SeachController();
