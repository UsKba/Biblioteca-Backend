import { isBefore } from 'date-fns';

import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

export function assertNoticeExpiredDateIsNotBeforeOfNow(date: Date) {
  const now = new Date();
  const dateOnBrazilTimezone = getDateOnBrazilTimezone(now);

  if (isBefore(date, dateOnBrazilTimezone)) {
    throw new RequestError('Essa data já passou');
  }
}
