export function sortCharactersByName(a: { full_name: string }, b: { full_name: string }) {
  if (a.full_name < b.full_name) return -1;
  if (a.full_name > b.full_name) return 1;

  return 0;
}

export function sortEntitiesByTitle(a: { title: string }, b: { title: string }) {
  if (a.title > b.title) return 1;
  if (a.title < b.title) return -1;
  return 0;
}

export function sortEntitiesByName(a: { name: string }, b: { name: string }) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}
