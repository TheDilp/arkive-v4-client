import DiceBox from "@3d-dice/dice-box";
import DiceParser from "@3d-dice/dice-parser-interface";
import DisplayResults from "@3d-dice/dice-ui/src/displayResults"; // fui index exports are messed up -> going to src

export const DiceRollParser = new DiceParser();

export const DiceResults = new DisplayResults("#dice-box");

export const Dice = new DiceBox(
  "#dice-box", // target DOM element to inject the canvas for rendering
  {
    assetPath: "/assets/dice-box/",
    themeColor: "#ff0000",
    scale: 4,
  },
);

Dice.init();

export function constructFinalRollDisplay(res: {
  value: number;
  valid: boolean;
  dice: { value: number; rolls: { value: number; critical: "success" | "failure"; order: number; type: "die" | "number" }[] }[];
  ops: ("+" | "-" | "/" | "*")[];
}) {
  if (res.valid) {
    const formatted = res.dice.map((die, idx) => {
      if (die?.rolls?.length) {
        return `${idx === 0 ? "" : "+"}${die.rolls.map((roll) => roll.value.toString()).join("+")}`;
      }
      return `${res?.ops?.[idx - 1] || "+"}${die.value}`;
    });
    return `${formatted.join("")}= ${res.value}`;
  }
  return "";
}
