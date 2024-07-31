// eslint-disable-next-line import/extensions
import "../modules.d.ts";

import DiceBox from "@3d-dice/dice-box";
import DiceParser from "@3d-dice/dice-parser-interface";
import ls from "localstorage-slim";

import { NotificationType } from "../../types";
import { DefaultTagColor, IconEnum } from "../enums";

const defaultDiceColor = ls.get("default_dice_color");
// eslint-disable-next-line no-undef
export const DiceRollParser = IS_PUBLIC ? null : new DiceParser();
// eslint-disable-next-line no-undef
export const Dice = IS_PUBLIC
  ? null
  : new DiceBox(
      "#dice-box", // target DOM element to inject the canvas for rendering
      {
        assetPath: "/assets/dice-box/",
        themeColor: DefaultTagColor,
        scale: 4,
        throwForce: 15,
      }
    );

Dice?.init().then(() => {
  document.addEventListener("mousedown", () => {
    Dice?.clear();
  });
});

export function getCritColor(critical: "success" | "failure" | null | undefined) {
  if (!critical) return "";
  if (critical === "success") return "text-green-400 font-bold";
  if (critical === "failure") return "text-red-400 font-bold";
  return "";
}
export const DiceRollRegex =
  /(((([(])?(\d{1,10})?([Dd]\d+))([)])?)(((kh)|(dl)|(kl)|(dh))(\d+))?([)])?([*+-/()])?(\d+)?([*+-/()])?)+/giu;

export async function getRollValue(notation: string, hasNoSimulation?: boolean) {
  const parsedNotation = DiceRollParser.parseNotation(notation);
  if (hasNoSimulation) {
    Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor, suspendSimulation: true });

    const rollData = await Dice.roll(parsedNotation);
    const { value } = DiceRollParser.parseFinalResults(rollData);
    Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor, suspendSimulation: false });
    return value;
  }

  const rollData = await Dice.roll(parsedNotation);
  const { value } = DiceRollParser.parseFinalResults(rollData);
  return value;
}

export async function rollDiceWithNotification(
  createNotification: (notification: Omit<NotificationType, "id">) => void,
  diceRoll: string,
  hasNoSimulation?: boolean
) {
  if (diceRoll) {
    try {
      const parsedNotation = DiceRollParser.parseNotation(diceRoll);
      if (hasNoSimulation) Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor, suspendSimulation: true });
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
      if (hasNoSimulation) Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor, suspendSimulation: false });
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
