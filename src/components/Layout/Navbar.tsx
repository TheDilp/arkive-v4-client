import { useAtomValue } from "jotai";
import { useState } from "react";

import { NotificationType } from "../../types";
import { DiceRollRegex, IconEnum, navbarTitleAtom, useNotifications } from "../../utils";
import { constructFinalRollDisplay, Dice, DiceRollParser } from "../../utils/ui/diceRollerUtils";
import { Button, Input } from "../Form";
import { Tooltip } from "../Overlay";
import { Card } from "./Card";

async function rollDice(createNotification: (notification: Omit<NotificationType, "id">) => void, diceRoll: string) {
  if (diceRoll) {
    try {
      const parsedNotation = DiceRollParser.parseNotation(diceRoll);
      Dice.roll(parsedNotation)
        .then((r: any) => {
          const rollData = DiceRollParser.parseFinalResults(r);
          if (rollData?.valid) {
            createNotification({
              timer: 2,
              title: constructFinalRollDisplay(rollData),
              variant: "info",
              position: "top",
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

export function Navbar() {
  const navbarTitle = useAtomValue(navbarTitleAtom);
  const createNotification = useNotifications();
  const [diceRoll, setDiceRoll] = useState("");
  return (
    <div className="flex h-16 min-h-[4rem] justify-between border-b border-zinc-800 bg-zinc-900 shadow">
      <h1 className="flex h-full select-none items-center  pl-4 font-merriweather text-3xl text-white">
        <span className="truncate">{navbarTitle || "The Arkive"}</span>
      </h1>
      <div className="w-min pr-4">
        <Tooltip
          arrowColor="#27272a"
          content={
            <Card title="Roll dice">
              <div className="flex flex-col gap-y-2">
                <Input
                  name="diceRoll"
                  onChange={(e) => setDiceRoll(e.value as string)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      if (!diceRoll.match(DiceRollRegex)) {
                        createNotification({
                          timer: 2,
                          title: "The dice roll notation is not valid.",
                          icon: IconEnum.warning,
                          variant: "error",
                          position: "top",
                        });
                      } else {
                        await rollDice(createNotification, diceRoll);
                      }
                    }
                  }}
                  placeholder="E.g. d20+d4-2"
                  value={diceRoll}
                />
                <Button
                  icon={IconEnum.d20}
                  isDisabled={!diceRoll || !diceRoll.match(DiceRollRegex)}
                  label="Roll"
                  onClick={async () => rollDice(createNotification, diceRoll)}
                  variant="info"
                />
              </div>
            </Card>
          }
          isClickable>
          <div className="h-full">
            <Button hasNoBackground icon={IconEnum.d20} iconSize={24} onClick={undefined} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
