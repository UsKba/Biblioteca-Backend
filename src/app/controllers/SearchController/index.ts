import { Response } from 'express';

import { RequestAuthQuery } from '~/types/auth';

import prisma from '~/prisma';

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
    });

    return res.json(users);
  }
}

export default new SeachController();
