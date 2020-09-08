import { Response } from 'express';

import { encodeToken } from '~/app/utils/auth';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

interface StoreBody {
  name: string;
  email: string;
  enrollment: string;
}

type StoreRequest = RequestBody<StoreBody>;

class SessionController {
  async store(req: StoreRequest, res: Response) {
    const { enrollment, name, email } = req.body;

    let user = await prisma.user.findOne({ where: { enrollment } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          enrollment,
          email,
          name,
        },
      });
    }

    return res.json({
      user,
      token: encodeToken(user),
    });
  }
}

export default new SessionController();
