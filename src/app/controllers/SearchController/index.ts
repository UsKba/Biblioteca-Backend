import { Response } from 'express';

import { RequestAuthQuery } from '~/types/auth';

import prisma from '~/prisma';

import { formatUserToResponse } from '../UserController/utils';

type ShowSearch = {
  name?: string;
  enrollment?: string;
  email?: string;
};

type ShowRequest = RequestAuthQuery<ShowSearch>;

class SeachController {
  async index(req: ShowRequest, res: Response) {
    const { name, email, enrollment } = req.query;

    const users = await prisma.user.findMany({
      where: {
        name: { contains: name },
        enrollment: { contains: enrollment },
        email: { contains: email },
      },
      include: {
        color: true,
      },
    });

    const usersFormatted = users.map(formatUserToResponse);

    return res.json(usersFormatted);
  }
}

export default new SeachController();
