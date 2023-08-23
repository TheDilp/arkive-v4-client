import { expect, test } from "vitest";

import { sortEntities } from "./sort";
import { deleteObjectPropsRecursive, removeFalsy } from "./transform";

test("sort entities highest to lowest", () => {
  expect([{ sort: 5 }, { sort: 7 }, { sort: 21 }, { sort: 1 }, { sort: 12 }].sort(sortEntities)).toStrictEqual([
    { sort: 21 },
    { sort: 12 },
    { sort: 7 },
    { sort: 5 },
    { sort: 1 },
  ]);
});

test("object has properties recursively removed", () => {
  const newObject = deleteObjectPropsRecursive({ a: 1, b: 2, c: 3, d: 4, e: 5, f: { a: 12, b: { a: 1, c: 3, f: 10 } } }, [
    "a",
    "c",
  ]);
  expect(newObject).not.toHaveProperty(["a", "c", "f.a"]);
  expect(newObject).toHaveProperty("b", 2);
  expect(newObject).toHaveProperty("d", 4);
  expect(newObject).toHaveProperty("e", 5);
  expect(newObject).toHaveProperty("f", { b: { f: 10 } });
});

test("object has falsy values removed", () => {
  const isNotFalsy = (item: any) => Boolean(item);
  const newObject = removeFalsy({ a: false, b: null, c: undefined, d: "", f: NaN, g: 0, h: 1, i: "string", j: [], k: {} });
  expect(Object.values(newObject)).toSatisfy(isNotFalsy);
});
