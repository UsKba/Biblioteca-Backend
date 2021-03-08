import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestParamsId } from '~/types/request';
import { RequestAuth, RequestAuthBody, RequestAuthBodyParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertComputerNotExists, assertComputerExists, assertIsValidComputerStatus } from './tradingRules';

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

    try {
      await assertComputerNotExists({ identification });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

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

    try {
      await assertComputerExists({ id });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

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
