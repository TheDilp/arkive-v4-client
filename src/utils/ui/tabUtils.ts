export function getCharacterProfileTabFromType(type: string | undefined): number {
  if (type === "resources") return 0;
  if (type === "relationships") return 1;
  if (type === "additional fields") return 2;
  if (type === "conversations") return 3;
  return 0;
}
