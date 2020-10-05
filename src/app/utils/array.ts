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
