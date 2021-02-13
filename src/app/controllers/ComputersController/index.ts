import { Response } from 'express';

import { RequestParamsId } from '~/types/request';
import { RequestAuth, RequestAuthBody, RequestAuthBodyParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

interface StoreBody {
  identification: string;
  local: string;
  status: number;
}

interface UpdateBody {
  identification?: string;
  local?: string;
  status?: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreBody>;
type UpdateRequest = RequestAuthBodyParamsId<UpdateBody>;

class ComputerController {
  async store(req: StoreRequest, res: Response) {
    const { identification, local, status } = req.body;

    const computer = await prisma.computer.create({
      data: {
        identification,
        local,
        status,
      },
    });

    return res.json(computer);
  }

  async index(req: IndexRequest, res: Response) {
    const computers = await prisma.computer.findMany({});

    return res.json(computers);
  }

  async update(req: UpdateRequest, res: Response) {
    const id = Number(req.params.id);
    const { identification, status, local } = req.body;

    const computer = await prisma.computer.update({
      data: {
        identification,
        status,
        local,
      },
      where: { id },
    });

    return res.json(computer);
  }

  async delete(req: RequestParamsId, res: Response) {
    const id = Number(req.params.id);

    await prisma.computer.delete({
      where: { id },
    });

    return res.json({ id });
  }
}

export default new ComputerController();
