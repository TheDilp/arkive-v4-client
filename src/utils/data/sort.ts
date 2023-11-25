import { CharacterRelatedType } from "../../types";

export function sortEntities(a: { sort: number }, b: { sort: number }) {
  return a.sort - b.sort;
}

export function sortCharactersByName(a: CharacterRelatedType, b: CharacterRelatedType) {
  if (a.full_name < b.full_name) return -1;
  if (a.full_name > b.full_name) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  if ((a.relation_title || "") < (b.relation_title || "")) return -1;
  if ((a.relation_title || "") > (b.relation_title || "")) return 1;
  return 0;
}
