import DiceBox from "@3d-dice/dice-box";
import DiceParser from "@3d-dice/dice-parser-interface";
import DisplayResults from "@3d-dice/dice-ui/src/displayResults"; // fui index exports are messed up -> going to src

import { NotificationType } from "../../types";
import { DefaultTagColor, IconEnum } from "../enums";

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

export const DiceNoSim = new DiceBox(
  "#dice-box-no-sim", // target DOM element to inject the canvas for rendering
  {
    id: "no-sim-canvas",
    assetPath: "/assets/dice-box/",
    suspendSimulation: true,
  },
);

DiceNoSim.init();

Dice.init().then(() => {
  document.addEventListener("mousedown", () => {
    Dice.clear();
    DiceResults.clear();
  });
});

export function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
export function getCritColor(critical: "success" | "failure" | null | undefined) {
  if (!critical) return "";
  if (critical === "success") return "text-green-400 font-bold";
  if (critical === "failure") return "text-red-400 font-bold";
  return "";
}
export const DiceRollRegex = /(((([(])?(\d+)?[Dd]\d+)([)])?|(\d+))((kh)|(dl))?([)])?([*+-/()])?)+/gi;

export async function getRollValue(notation: string, hasNoSimulation?: boolean) {
  const parsedNotation = DiceRollParser.parseNotation(notation);
  if (hasNoSimulation) {
    const rollData = await DiceNoSim.roll(parsedNotation);
    const { value } = DiceRollParser.parseFinalResults(rollData);
    return value;
  }

  const rollData = await Dice.roll(parsedNotation);
  const { value } = DiceRollParser.parseFinalResults(rollData);
  return value;
}

export function parseDiceResults(r: any) {
  const parsedNotation = DiceRollParser.parseNotation(r);

  const rollData = DiceRollParser.parseFinalResults(parsedNotation);
  return rollData;
}

export async function rollDiceWithNotification(
  createNotification: (notification: Omit<NotificationType, "id">) => void,
  diceRoll: string,
) {
  if (diceRoll) {
    try {
      const parsedNotation = DiceRollParser.parseNotation(diceRoll);
      Dice.roll(parsedNotation)
        .then((r: any) => {
          const rollData = DiceRollParser.parseFinalResults(r);
          if (rollData?.valid) {
            createNotification({
              timer: 15,
              title: "Dice roll",
              variant: "info",
              position: "top",
              type: "dice_roll",
              data: rollData,
            });
          }
        })
        .catch(() => {
          createNotification({
            timer: 2,
            title: "The dice roll notation is not valid.",
            icon: IconEnum.warning,
            variant: "error",
            position: "top",
          });
        });
    } catch (error) {
      createNotification({
        timer: 2,
        title: "The dice roll notation is not valid.",
        icon: IconEnum.warning,
        variant: "error",
        position: "top",
      });
    }
  }
}
