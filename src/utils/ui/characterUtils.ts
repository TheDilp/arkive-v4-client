export function sortCharacters(
  a: { first_name: string; last_name?: string | null },
  b: { first_name: string; last_name?: string | null },
) {
  if (a.first_name < b.first_name) return -1;
  if (a.first_name > b.first_name) return 1;
  if (a.last_name && b.last_name) {
    if (a.last_name < b.last_name) return -1;
    if (a.last_name > b.last_name) return 1;
    return 0;
  }
  return 0;
}
