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

    const reserves = await prisma.reserve.findMany({
      where: {
        OR: [
          {
            day: startDay,
            month: startMonth,
            year: startYear,
          },
          {
            day: endDay,
            month: endMonth,
            year: endYear,
          },
        ],
      },
    });

    console.log(reserves);

    return res.json(reserves);
  }
}

export default new WeekReserve();
