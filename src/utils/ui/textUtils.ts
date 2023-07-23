export function getFirstLetters(sentence: string): string {
  const words = sentence.split(" ");
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}
export function getAvatarInitials(first_name: string, last_name: string): string {
  return `${first_name.charAt(0)}${last_name.charAt(0)}`;
}
export function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function capitalizeSentence(sentence: string): string {
  return sentence.toUpperCase();
}

export function getCharacterFullName(first_name: string, nickname?: string | null, last_name?: string | null): string {
  return `${first_name.trim()}${nickname ? ` ${nickname} ` : " "}${last_name || ""}`;
}

export function getSentenceCase(field: string) {
  const result = field.replaceAll("_", " ").replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function validateHexCode(hex: string) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}
