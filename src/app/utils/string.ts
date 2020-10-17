export function slug(str: string) {
  return str.toLocaleLowerCase().trim().split(' ').join('-');
}
