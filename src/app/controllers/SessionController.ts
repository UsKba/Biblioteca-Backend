import { Response } from 'express';

import { encodeToken } from '~/app/utils/auth';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

interface StoreBody {
  enrollment: string;
}

type StoreRequest = RequestBody<StoreBody>;

class SessionController {
  async store(req: StoreRequest, res: Response) {
    const { enrollment } = req.body;

    const user = await prisma.user.findOne({ where: { enrollment } });

    if (!user) {
      return res.status(400).json({ error: 'Matrícula não encontrada' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        enrollment: user.enrollment,
        email: user.email,
      },

      token: encodeToken(user),
    });
  }
}

export default new SessionController();
