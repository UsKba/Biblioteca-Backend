import { Request, Response } from 'express';

import { RequestBody, RequestParamsId, RequestBodyParamsId } from '~/types/request';

import prisma from '~/prisma';

import { assertUserNotExists, assertUserExists } from './tradingRules';
import { createUser, formatUserToResponse } from './utils';

interface StoreBody {
  name: string;
  email: string;
  enrollment: string;
}

interface UpdateBody {
  name?: string;
  email?: string;
}

type StoreRequest = RequestBody<StoreBody>;
type UpdateRequest = RequestBodyParamsId<UpdateBody>;

class UserController {
  async index(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      include: {
        color: true,
        role: true,
      },
    });

    const usersFormatted = users.map(formatUserToResponse);

    return res.json(usersFormatted);
  }

  async show(req: RequestParamsId, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findOne({
      where: { id: Number(id) },
      include: {
        color: true,
        role: true,
      },
    });

    if (user === null) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const userFormatted = formatUserToResponse(user);

    return res.json(userFormatted);
  }

  async store(req: StoreRequest, res: Response) {
    const { enrollment, email, name } = req.body;

    try {
      const user = await createUser({ enrollment, email, name });
      const userFormatted = formatUserToResponse(user);

      return res.json(userFormatted);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async update(req: UpdateRequest, res: Response) {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    try {
      await assertUserExists({ id });

      if (email) {
        await assertUserNotExists({ email });
      }
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const user = await prisma.user.update({
      data: {
        name,
        email,
      },
      where: { id },
      include: {
        role: true,
        color: true,
      },
    });

    const userFormatted = formatUserToResponse(user);

    return res.json(userFormatted);
  }
}

export default new UserController();
