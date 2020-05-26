import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Body {
  name: string;
  age: number;
  id: number;
}

class UserController {
  async index(request: Request, response: Response) {
    const users = await prisma.user.findMany({});

    return response.json(users);
  }

  async store(request: Request, response: Response) {
    const user = await prisma.user.create({
      data: request.body,
    });

    // Retornar para verificar
    return response.json(user);
  }

  async update(request: Request, response: Response) {
    const { id, ...dataToUpdate }: Body = request.body;

    const user = await prisma.user.update({
      data: dataToUpdate,
      where: { id },
    });

    return response.json(user);
  }
}

export default new UserController();

// TODO

// Testes
