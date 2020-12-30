import { Response } from 'express';

import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestQuery } from '~/types';

import prisma from '~/prisma';

import { formatReservesToResponse } from '../ReserveController/utils';

type AllReservesIndex = {
  startDate: string;
  endDate: string;
};

type IndexRequest = RequestQuery<AllReservesIndex>;

class AllReserves {
  async index(req: IndexRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const [startYear, startMonth, startDay] = startDate.split('/').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('/').map(Number);

    const tempStartDate = new Date(startYear, startMonth, startDay);
    const tempEndDate = new Date(endYear, endMonth, endDay);

    const startReserveDate = getDateOnBrazilTimezone(tempStartDate);
    const endReserveDate = getDateOnBrazilTimezone(tempEndDate);

    const reserves = await prisma.reserve.findMany({
      where: {
        date: {
          gte: startReserveDate,
          lt: endReserveDate,
        },
      },
      include: {
        room: true,
        schedule: true,
        userReserve: { include: { user: { include: { color: true } } } },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const reservesFormatted = formatReservesToResponse(reserves);

    return res.json(reservesFormatted);
  }
}

export default new AllReserves();
