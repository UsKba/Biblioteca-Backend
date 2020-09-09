import { Request, Response } from 'express';

import { RequestBody, RequestParamsId, RequestBodyParamsId } from '~/types';

import prisma from '~/prisma';

import { assertEnrollmentNotExists, assertEmailNotExists, assertUserIdExists } from './tradingRules';

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
  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany({});

    return response.json(users);
  }

  async show(request: RequestParamsId, response: Response) {
    const { id } = request.params;

    const user = await prisma.user.findOne({
      where: { id: Number(id) },
    });

    if (user === null) {
      return response.status(400).json({ error: 'Usuário não encontrado' });
    }

    return response.json(user);
  }

  async store(request: StoreRequest, response: Response) {
    const { enrollment, email, name } = request.body;

    try {
      await assertEnrollmentNotExists(enrollment);
      await assertEmailNotExists(email);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const user = await prisma.user.create({
      data: {
        enrollment,
        email,
        name,
      },
    });

    return response.json(user);
  }

  async update(request: UpdateRequest, response: Response) {
    const id = Number(request.params.id);
    const { name, email } = request.body;

    try {
      await assertUserIdExists(id);
      if (email) await assertEmailNotExists(email);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const user = await prisma.user.update({
      data: {
        name,
        email,
      },
      where: { id },
    });

    return response.json(user);
  }
}

export default new UserController();
