import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestParamsId } from '~/types/request';
import { RequestAuth, RequestAuthBody, RequestAuthBodyParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { updateComputer } from './functions';
import { assertComputerExists, assertIsValidComputerStatus } from './tradingRules';
import { formatComputerToResponse } from './utils';

interface StoreBody {
  identification: string;
  status: number;
  localId: number;
}

interface UpdateBody {
  identification?: string;
  status?: number;
  localId?: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreBody>;
type UpdateRequest = RequestAuthBodyParamsId<UpdateBody>;

class ComputerController {
  async index(req: IndexRequest, res: Response) {
    const computers = await prisma.computer.findMany({
      include: {
        local: true,
      },
    });

    const computersFomatted = computers.map(formatComputerToResponse);

    return res.json(computersFomatted);
  }

  async store(req: StoreRequest, res: Response) {
    const { identification, localId, status } = req.body;

    const computer = await prisma.computer.create({
      data: {
        identification,
        status,
        local: { connect: { id: localId } },
      },
      include: {
        local: true,
      },
    });

    const computerFormatted = formatComputerToResponse(computer);

    return res.json(computerFormatted);
  }

  async update(req: UpdateRequest, res: Response) {
    const id = Number(req.params.id);
    const { identification, status, localId } = req.body;

    try {
      const computerUpdated = await updateComputer({ id, identification, status, localId });
      const computerFormatted = formatComputerToResponse(computerUpdated);

      return res.json(computerFormatted);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }

  async delete(req: RequestParamsId, res: Response) {
    const id = Number(req.params.id);

    try {
      await assertComputerExists({ id });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    await prisma.computer.delete({
      where: { id },
    });

    return res.json({ id });
  }
}

export default new ComputerController();
