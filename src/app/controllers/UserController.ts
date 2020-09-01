import { Request, Response } from 'express';

import { RequestBody, RequestParamsId, RequestBodyParamsId } from '~/types';

import prisma from '~/prisma';

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

    const enrollmentExists = await prisma.user.findOne({
      where: { enrollment },
    });

    if (enrollmentExists) {
      return response.status(400).json({ error: 'matricula já está cadastrada' });
    }

    const emailExists = await prisma.user.findOne({
      where: { email },
    });

    if (emailExists) {
      return response.status(400).json({ error: 'email já cadastrado' });
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
    const { id } = request.params;
    const { name, email } = request.body;

    const userIdExists = await prisma.user.findOne({
      where: { id: Number(id) },
    });

    if (userIdExists === null) {
      return response.status(400).json({ error: 'Usuário não encontrado' });
    }

    if (email) {
      const emailExists = await prisma.user.findOne({
        where: { email },
      });

      if (emailExists) {
        return response.status(400).json({ error: 'email já cadastrado' });
      }
    }

    const user = await prisma.user.update({
      data: {
        name,
        email,
      },
      where: { id: Number(id) },
    });

    console.log('user', user);

    return response.json(user);
  }
}

export default new UserController();
