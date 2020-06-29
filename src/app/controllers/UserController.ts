import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Body {
  enrollment: number;
  password: string;
}

function makeSuapRequest(params: Body) {
  // FAZER A REQUISICAO

  return {
    name: 'Idaslon',
    email: 'Lonlon@gmail.com',
    ...params,
  };
}

class UserController {
  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany({});

    return response.json(users);
  }

  async store(request: Request, response: Response) {
    const data = makeSuapRequest(request.body);

    const user = await prisma.user.create({
      data,
    });

    return response.json(user);
  }
}

export default new UserController();
