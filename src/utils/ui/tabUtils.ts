export function getCharacterProfileTabFromType(type: string | undefined): number {
  if (type === "biography") return 0;
  if (type === "relationships") return 1;
  if (type === "additional fields") return 2;
  if (type === "resources") return 3;
  if (type === "conversations") return 4;
  return 0;
}
