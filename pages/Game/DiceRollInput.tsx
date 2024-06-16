import { useState } from "react";

import { Button, Input } from "../../components";
import { DefaultTagColor, Dice, DiceRollRegex, IconEnum, rollDiceWithNotification, useNotifications } from "../../utils";

export function DiceRollInput() {
  const createNotification = useNotifications();
  const [diceRoll, setDiceRoll] = useState("");
  return (
    <div className="flex flex-nowrap gap-x-2">
      <Input
        name="diceRoll"
        onChange={(e) => setDiceRoll(e.value as string)}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            Dice.updateConfig({
              themeColor: DefaultTagColor,
            });
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
              setDiceRoll("");
            }
          }
        }}
        placeholder="E.g. d20+d4-2"
        value={diceRoll}
        variant="primary"
      />
      <div>
        <Button
          icon={IconEnum.d20}
          isDisabled={!diceRoll || !diceRoll.match(DiceRollRegex)}
          isIconOnly
          label="Roll"
          onClick={async () => {
            Dice.updateConfig({
              themeColor: DefaultTagColor,
            });
            await rollDiceWithNotification(createNotification, diceRoll);

            setDiceRoll("");
          }}
          variant="info"
        />
      </div>
    </div>
  );
}
