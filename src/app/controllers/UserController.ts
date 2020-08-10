import { Request, Response } from 'express';

import { RequestBody, RequestParamsId } from '~/types';

import prisma from '~/prisma';

interface Body {
  enrollment: string;
  password: string;
}

type UpdateRequest = RequestBody<Body>;

function makeSuapRequest(params: Body) {
  // FAZER A REQUISICAO

  return {
    name: 'KADUU',
    email: 'kads@gmail.com',
    ...params,
  };
}

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

  async store(request: Request, response: Response) {
    const data = makeSuapRequest(request.body);

    const user = await prisma.user.create({
      data,
    });

    return response.json(user);
  }

  async update(request: UpdateRequest, response: Response) {
    const { enrollment, ...dataToUpdate } = request.body;

    const userExists = await prisma.user.findOne({
      where: { enrollment },
    });

    if (userExists === null) {
      return response.status(400).json({ error: 'Usuário não encontrado' });
    }

    const user = await prisma.user.update({
      data: dataToUpdate,
      where: { enrollment },
    });

    return response.json(user);
  }
}

export default new UserController();
