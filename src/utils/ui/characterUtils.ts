import { CharacterType } from "../../types";

export function sortCharacters(a: Pick<CharacterType, "full_name">, b: Pick<CharacterType, "full_name">) {
  if (a.full_name !== undefined && b.full_name === undefined) return -1;
  if (a.full_name === undefined && b.full_name !== undefined) return 1;
  if (!!a.full_name && !!b.full_name) {
    if (a.full_name < b.full_name) return -1;
    if (a.full_name > b.full_name) return 1;
    return 0;
  }
  return 0;
}
