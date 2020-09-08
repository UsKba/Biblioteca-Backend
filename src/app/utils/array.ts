export function haveDuplicates(array: any[]) {
  const tempArray = [] as any[];

  for (let i = 0; i < array.length; i += 1) {
    const elementExists = tempArray.findIndex((element) => element === array[i]);

    if (elementExists !== -1) {
      return true;
    }

    tempArray.push(array[i]);
  }

  return false;
}
