import DiceBox from "@3d-dice/dice-box";
import DiceParser from "@3d-dice/dice-parser-interface";
import DisplayResults from "@3d-dice/dice-ui/src/displayResults"; // fui index exports are messed up -> going to src

import { DefaultTagColor } from "../enums";

export const DiceRollParser = new DiceParser();

export const DiceResults = new DisplayResults("#dice-box");

export const Dice = new DiceBox(
  "#dice-box", // target DOM element to inject the canvas for rendering
  {
    assetPath: "/assets/dice-box/",
    themeColor: DefaultTagColor,
    scale: 4,
    throwForce: 10,
  },
);

Dice.init().then(() => {
  document.addEventListener("mousedown", () => {
    Dice.clear();
    DiceResults.clear();
  });
});

export function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
export const DiceRollRegex = /(\d+)(([1-9]\d*)?([Dd])?[1-9]?((kh|dl)\d+)*( ?[*+-] ?)?)+()/gi;

export function constructFinalRollDisplay(res: {
  value: number;
  valid: boolean;
  dice?: {
    value: number;
    rolls: {
      value: number;
      critical: "success" | "failure";
      order: number;
      type: "die" | "number";
      drop?: boolean | undefined;
    }[];
  }[];
  rolls?: {
    value: number;
    critical: "success" | "failure";
    order: number;
    drop?: boolean | undefined;
    type: "die" | "number";
  }[];
  ops: ("+" | "-" | "/" | "*")[];
}) {
  if (res.valid) {
    const formatted = (res?.dice || res?.rolls || []).map((die, idx) => {
      if ("rolls" in die) {
        if (die?.rolls?.length) {
          return `${idx === 0 ? "" : res?.ops?.[idx - 1] || "+"}${die.rolls
            .filter((r) => !r.drop)
            .map((roll) => roll.value.toString())
            .join("+")}`;
        }
        return `${res?.ops?.[idx - 1] || "+"}${die.value}`;
      }

      if (res?.ops?.[idx - 1]) {
        if (!die?.drop) return `${res?.ops?.[idx - 1] || "+"}${die.value}`;
        return "";
      }
      if (!die?.drop) return `${idx === 0 ? "" : "+"}${die.value.toString()}`;
      return "";
    });
    const formattedString = formatted.join("");
    if (formattedString.charAt(0) === "+") {
      return `${formattedString.slice(1, formattedString.length)}= ${res.value}`;
    }
    return `${formattedString}= ${res.value}`;
  }
  return "";
}
