import { useAtomValue } from "jotai";
import { useState } from "react";

import { IconEnum, navbarTitleAtom, useNotifications } from "../../utils";
import { DiceRollRegex, rollDiceWithNotification } from "../../utils/ui/diceRollerUtils";
import { Button, Input } from "../Form";
import { Tooltip } from "../Overlay";
import { Card } from "./Card";

function DiceRoller() {
  const createNotification = useNotifications();
  const [diceRoll, setDiceRoll] = useState("");
  return (
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
                await rollDiceWithNotification(createNotification, diceRoll);
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
          onClick={async () => rollDiceWithNotification(createNotification, diceRoll)}
          variant="info"
        />
      </div>
    </Card>
  );
}

export function Navbar() {
  const navbarTitle = useAtomValue(navbarTitleAtom);

  return (
    <div className="flex h-16 min-h-[4rem] flex-1 justify-between border-b border-zinc-800 bg-zinc-900 shadow">
      <h1 className="flex h-full select-none items-center pl-4 font-merriweather text-3xl text-white">
        <div className="w-1/2 truncate lg:w-max">{navbarTitle || "The Arkive"}</div>
      </h1>
      <div className="w-min pr-4">
        <Tooltip arrowColor="#27272a" content={<DiceRoller />} customOffset={{ mainAxis: 25, crossAxis: 50 }} isClickable>
          <div className="h-full">
            <Button hasNoBackground icon={IconEnum.d20} iconSize={24} onClick={undefined} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
