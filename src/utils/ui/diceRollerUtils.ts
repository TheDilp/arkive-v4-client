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

export function constructFinalRollDisplay(res: {
  value: number;
  valid: boolean;
  dice?: {
    value: number;
    rolls: { value: number; critical: "success" | "failure"; order: number; type: "die" | "number" }[];
  }[];
  rolls?: { value: number; critical: "success" | "failure"; order: number; type: "die" | "number" }[];
  ops: ("+" | "-" | "/" | "*")[];
}) {
  if (res.valid) {
    const formatted = (res?.dice || res?.rolls || []).map((die, idx) => {
      if ("rolls" in die) {
        if (die?.rolls?.length) {
          return `${idx === 0 ? "" : res?.ops?.[idx - 1] || "+"}${die.rolls.map((roll) => roll.value.toString()).join("+")}`;
        }
        return `${res?.ops?.[idx - 1] || "+"}${die.value}`;
      }
      if (res?.ops?.[idx - 1]) {
        return `${res?.ops?.[idx - 1] || "+"}${die.value}`;
      }
      return `${idx === 0 ? "" : "+"}${die.value.toString()}`;
    });
    return `${formatted.join("")}= ${res.value}`;
  }
  return "";
}
