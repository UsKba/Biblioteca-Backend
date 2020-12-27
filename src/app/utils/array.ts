export function haveDuplicates<T = never>(array: T[]) {
  const tempArray = [] as T[];

  for (let i = 0; i < array.length; i += 1) {
    const targetElement = array[i];
    const elementExists = tempArray.findIndex((element) => element === targetElement);

    if (elementExists !== -1) {
      return true;
    }

    tempArray.push(targetElement);
  }

  return false;
}

export function subtractElements<T>(array1: T[], array2: T[]) {
  const subtractedArray = array1.filter((element) => !array2.includes(element));

  return subtractedArray;
}

export function getRandomItem<T>(array: T[]) {
  const item = array[Math.floor(Math.random() * array.length)];

  return item;
}
