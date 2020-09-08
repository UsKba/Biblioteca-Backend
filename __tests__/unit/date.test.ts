import { splitSingleDate, stringToDate, stringsToDateArray } from '~/app/utils/date';

describe('splitSingleDate', () => {
  it('should be able to split `08:30` into hours and minutes', () => {
    const [hours, minutes] = splitSingleDate('08:30');

    expect(hours).toBe(8);
    expect(minutes).toBe(30);
  });

  it('should be able to split `08:00` into hours and minutes', () => {
    const [hours, minutes] = splitSingleDate('08:00');

    expect(hours).toBe(8);
    expect(minutes).toBe(0);
  });

  it('should be able to split `00:30` into hours and minutes', () => {
    const [hours, minutes] = splitSingleDate('00:30');

    expect(hours).toBe(0);
    expect(minutes).toBe(30);
  });

  it('should be able to split `00:00` into hours and minutes', () => {
    const [hours, minutes] = splitSingleDate('00:00');

    expect(hours).toBe(0);
    expect(minutes).toBe(0);
  });
});

describe('stringToDate', () => {
  it('should be able to split `08:30` into hours and minutes', () => {
    const date1 = stringToDate('08:30');
    const date2 = stringToDate('09:30');

    expect(date1.getHours()).toBe(8);
    expect(date1.getMinutes()).toBe(30);

    expect(date2.getHours()).toBe(9);
    expect(date2.getMinutes()).toBe(30);
  });

  it('should be able to split `08:00` into hours and minutes', () => {
    const date1 = stringToDate('08:00');

    expect(date1.getHours()).toBe(8);
    expect(date1.getMinutes()).toBe(0);
  });

  it('should be able to split `00:00` into hours and minutes', () => {
    const date1 = stringToDate('00:00');

    expect(date1.getHours()).toBe(0);
    expect(date1.getMinutes()).toBe(0);
  });
});

describe('stringsToDateArray', () => {
  it('should be able to split `08:30` and `09:30` into Dates', () => {
    const [date1, date2] = stringsToDateArray('08:30', '09:30');

    expect(date1.getHours()).toBe(8);
    expect(date1.getMinutes()).toBe(30);

    expect(date2.getHours()).toBe(9);
    expect(date2.getMinutes()).toBe(30);
  });

  it('should be able to split `08:00` and `09:00` into Dates', () => {
    const [date1, date2] = stringsToDateArray('08:00', '09:00');

    expect(date1.getHours()).toBe(8);
    expect(date1.getMinutes()).toBe(0);

    expect(date2.getHours()).toBe(9);
    expect(date2.getMinutes()).toBe(0);
  });

  it('should be able to split `00:30` and `00:00` into Dates', () => {
    const [date1, date2] = stringsToDateArray('00:30', '00:00');

    expect(date1.getHours()).toBe(0);
    expect(date1.getMinutes()).toBe(30);

    expect(date2.getHours()).toBe(0);
    expect(date2.getMinutes()).toBe(0);
  });
});
