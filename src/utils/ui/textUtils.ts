export function getFirstLetters(sentence: string): string {
  const words = sentence.split(" ");
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}
export function getAvatarInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}
export function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function capitalizeSentence(sentence: string): string {
  return sentence.toUpperCase();
}

export function getCharacterFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName || ""}`;
}

export function getSentenceCase(field: string) {
  const result = field.replaceAll("_", " ").replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
