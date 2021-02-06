export interface GenerateDateParams {
  sumYear?: number;
  sumMonth?: number;
  sumDay?: number;
}

type GenerateDateListParams = GenerateDateParams[];

function formatDate(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

function getNextWeekDay(date: Date) {
  const weekDay = date.getDay();

  if (weekDay === 0) {
    return date.getUTCDate() + 1;
  }

  if (weekDay === 6) {
    return date.getUTCDate() + 2;
  }

  return date.getUTCDate();
}

function getLastWeekDayDate(date: Date) {
  const weekDay = date.getDay();

  if (weekDay === 0) {
    return date.getUTCDate() - 2;
  }

  if (weekDay === 6) {
    return date.getUTCDate() - 1;
  }

  return date.getUTCDate();
}

function getWeekDayDate(params?: GenerateDateParams, rootDate?: Date) {
  function getData() {
    return {
      sumYear: Number(params?.sumYear || 0),
      sumMonth: Number(params?.sumMonth || 0),
      sumDay: Number(params?.sumDay || 0),
    };
  }

  function getDateData(date: Date) {
    const { sumYear, sumMonth, sumDay } = getData();

    return {
      newYear: date.getUTCFullYear() + sumYear,
      newMonth: date.getUTCMonth() + sumMonth,
      newDay: date.getUTCDate() + sumDay,
    };
  }

  function isToSubtract() {
    const { sumYear, sumMonth, sumDay } = getData();

    return sumYear < 0 || sumMonth < 0 || sumDay < 0;
  }

  function getTargetWeekDay(date: Date) {
    const isToSubstract = isToSubtract();

    if (isToSubstract) {
      return getLastWeekDayDate(date);
    }

    return getNextWeekDay(date);
  }

  const date = rootDate || new Date();

  const { newYear, newMonth, newDay } = getDateData(date);

  const newDate = new Date(newYear, newMonth, newDay);
  const day = getTargetWeekDay(newDate);

  return new Date(newDate.getFullYear(), newDate.getUTCMonth(), day);
}

export function generateDate(params?: GenerateDateParams) {
  const date = getWeekDayDate(params);

  return formatDate(date);
}

export function generateDateList(params: GenerateDateListParams) {
  function calculateSums() {
    const paramsArray = [];

    const sumParams = {
      day: 0,
      month: 0,
      year: 0,
    };

    for (let i = 0; i < params.length; i += 1) {
      const sumDay = Number(params[i]?.sumDay || 0);
      const sumMonth = Number(params[i]?.sumMonth || 0);
      const sumYear = Number(params[i]?.sumYear || 0);

      const newParams = {
        sumDay: sumDay - sumParams.day,
        sumMonth: sumMonth - sumParams.month,
        sumYear: sumYear - sumParams.year,
      };

      sumParams.day += sumDay;
      sumParams.month += sumMonth;
      sumParams.year += sumYear;

      paramsArray.push(newParams);
    }

    return paramsArray;
  }

  const dates = [];
  const paramsArray = calculateSums();

  let rootDate = new Date();
  for (let i = 0; i < paramsArray.length; i += 1) {
    const newDate = getWeekDayDate(paramsArray[i], rootDate);

    dates.push(formatDate(newDate));
    rootDate = newDate;
  }

  return dates;
}
