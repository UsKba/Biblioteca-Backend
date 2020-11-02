import { Response } from 'express';

import { RequestQuery } from '~/types';

import prisma from '~/prisma';

type WeekReserveIndex = {
  startDate: string;
  endDate: string;
};

type IndexRequest = RequestQuery<WeekReserveIndex>;

class WeekReserve {
  async index(req: IndexRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

    const startDate1 = new Date(startYear, startMonth, startDay);
    const endDate1 = new Date(endYear, endMonth, endDay);

    const reserves = await prisma.reserve.findMany({
      where: {
        OR: [
          {
            date: startDate1,
          },
          {
            date: endDate1,
          },
        ],
      },
    });

    console.log(reserves);

    return res.json(reserves);
  }
}

export default new WeekReserve();
