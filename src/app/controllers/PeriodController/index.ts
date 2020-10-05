import { Request, Response } from 'express';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

interface StoreBody {
  name: string;
  initialHour: string;
  endHour: string;
}

type StoreRequest = RequestBody<StoreBody>;

class PeriodController {
  async index(req: Request, res: Response) {
    const periods = await prisma.periods.findMany({});

    return res.json(periods);
  }

  async store(req: StoreRequest, res: Response) {
    const { name, initialHour, endHour } = req.body;

    const period = await prisma.periods.create({
      data: {
        name,
        initialHour,
        endHour,
      },
    });

    return res.json(period);
  }
}

export default new PeriodController();
