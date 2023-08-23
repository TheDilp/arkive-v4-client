import { expect, test } from "vitest";

import {
  capitalizeSentence,
  getAvatarInitials,
  getCharacterFullName,
  getFirstLetters,
  getNavbarEntityType,
  getSentenceCase,
  getSingularEntityType,
  validateHexCode,
} from "./textUtils";

test("return first letters of first two words in a sentence", () => {
  const sentence1 = "Jack walks Buck in the park every day.";
  const sentence2 = "Jack Ian Bryson";
  const sentence3 = "Jack Ian";
  const sentence4 = "Jack";
  const sentence5 = "walks his dog";

  expect(getFirstLetters(sentence1)).toBe("Jw");
  expect(getFirstLetters(sentence2)).toBe("JI");
  expect(getFirstLetters(sentence3)).toBe("JI");
  expect(getFirstLetters(sentence4)).toBe("J");
  expect(getFirstLetters(sentence5)).toBe("wh");
});

test("return initials for an avatar", () => {
  const character1 = { first_name: "Bob", last_name: "Dickinson" };
  const character2 = { first_name: "Jake", last_name: undefined };

  expect(getAvatarInitials(character1.first_name, character1.last_name)).toBe("BD");
  expect(getAvatarInitials(character2.first_name, character2?.last_name)).toBe("J");
});

test("return sentence with capitalized first word", () => {
  const sentence1 = "new York";
  const sentence2 = "hills";
  const sentence3 = "jack walks his dog in the park every day.";

  expect(capitalizeSentence(sentence1)).toBe("NEW YORK");
  expect(capitalizeSentence(sentence2)).toBe("HILLS");
  expect(capitalizeSentence(sentence3)).toBe("JACK WALKS HIS DOG IN THE PARK EVERY DAY.");
});

test("return navbar entity title for entity type", () => {
  expect(getNavbarEntityType("documents")).toBe("documents");
  expect(getNavbarEntityType("maps")).toBe("maps");
  expect(getNavbarEntityType("graphs")).toBe("graphs");
  expect(getNavbarEntityType("screens")).toBe("screens");
  expect(getNavbarEntityType("dictionaries")).toBe("dictionaries");
  expect(getNavbarEntityType("calendars")).toBe("calendars");
  expect(getNavbarEntityType("timelines")).toBe("timelines");
  expect(getNavbarEntityType("generators")).toBe("generators");
  expect(getNavbarEntityType("character_fields_templates")).toBe("character fields templates");
  expect(getNavbarEntityType("random_tables")).toBe("random tables");
  expect(getNavbarEntityType("tags")).toBe("tags");
});

test("return character's full name", () => {
  const character1 = { first_name: "Robert", nickname: "Bobby", last_name: "Dickinson" };
  const character2 = { first_name: "Jake", nickname: null, last_name: undefined };
  const character3 = { first_name: "Ian", nickname: "Black", last_name: undefined };
  const character4 = { first_name: "Orwell", nickname: undefined, last_name: "Weiss" };
  const character5 = { first_name: "Max", nickname: null, last_name: "Weiss" };

  expect(getCharacterFullName(character1.first_name, character1?.nickname, character1?.last_name)).toBe(
    "Robert Bobby Dickinson",
  );
  expect(getCharacterFullName(character2.first_name, character2?.nickname, character2?.last_name)).toBe("Jake");
  expect(getCharacterFullName(character3.first_name, character3?.nickname, character3?.last_name)).toBe("Ian Black");
  expect(getCharacterFullName(character4.first_name, character4?.nickname, character4?.last_name)).toBe("Orwell Weiss");
  expect(getCharacterFullName(character5.first_name, character5?.nickname, character5?.last_name)).toBe("Max Weiss");
});

test("return sentence case", () => {
  const sentence1 = "jack_walks_his_dog_in_the_park_every_day";
  const sentence2 = "random_tables";
  expect(getSentenceCase(sentence1)).toBe("Jack walks his dog in the park every day");
  expect(getSentenceCase(sentence2)).toBe("Random tables");
});

test("return singular entity type", () => {
  const type1 = "dictionaries";
  const type2 = "characters";
  const type3 = "random_tables";

  expect(getSingularEntityType(type1)).toBe("dictionary");
  expect(getSingularEntityType(type2)).toBe("character");
  expect(getSingularEntityType(type3)).toBe("random table");
});

test("return if hex code is valid", () => {
  expect(validateHexCode("#ffccbb")).toBe(true);
  expect(validateHexCode("#fffccc")).toBe(true);
  expect(validateHexCode("#ffccbsssb")).toBe(false);
  expect(validateHexCode("123123")).toBe(false);
});
