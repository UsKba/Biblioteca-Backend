const reserveConfig = {
  minClassmatesPerRoom: 3,
  maxClassmatesPerRoom: 6,

  maxReservesPerTurn: 2,

  turns: {
    morning: {
      initialHour: 7,
      endHour: 12,
    },
    afternoon: {
      initialHour: 13,
      endHour: 18,
    },
    night: {
      initialHour: 19,
      endHour: 22,
    },
  },
};

export default reserveConfig;
