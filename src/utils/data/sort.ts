export function sortEntities(a: { sort: number }, b: { sort: number }) {
  return b.sort - a.sort;
}
