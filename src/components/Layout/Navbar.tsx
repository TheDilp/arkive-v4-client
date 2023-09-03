import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

import { drawerAtom, IconEnum, navbarTitleAtom, useNotifications } from "../../utils";
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

  const setDrawer = useSetAtom(drawerAtom);

  function openSearchDrawer() {
    setDrawer((prev) => ({ ...prev, title: "Search", type: "search" }));
  }

  return (
    <div className="flex h-16 min-h-[4rem] flex-1 border-b border-zinc-800 bg-zinc-900 pr-4 shadow">
      <h1 className="mr-auto flex h-full select-none items-center pl-4 font-merriweather text-3xl text-white">
        <div className="w-1/2 truncate lg:w-max">{navbarTitle || "The Arkive"}</div>
      </h1>
      <div className="ml-auto flex items-center gap-x-2">
        <div className="ml-auto w-min">
          <Tooltip arrowColor="#27272a" content={<DiceRoller />} customOffset={{ mainAxis: 25, crossAxis: 50 }} isClickable>
            <div className="h-full">
              <Button hasNoBackground icon={IconEnum.d20} iconSize={24} onClick={undefined} />
            </div>
          </Tooltip>
        </div>
        <div className="ml-auto w-min">
          <div className="h-full">
            <Button hasNoBackground icon={IconEnum.search} iconSize={24} onClick={openSearchDrawer} />
          </div>
        </div>
      </div>
    </div>
  );
}
