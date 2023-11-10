import { useState } from "react";

import { HandleChangePropsType } from "../../../types";
import { DiceNoSim, DiceRollParser, IconEnum, useNotifications } from "../../../utils";
import { Button, Input } from "../../Form";
import { Collapsible } from "../../Layout";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  formula: string;
  currentValue: string | number | null;
};

export function TemplateDiceRollField({ title, name, formula, handleChange, id, currentValue }: Props) {
  const createNotification = useNotifications();
  const [isRolling, setIsRolling] = useState(false);
  return (
    <Collapsible label={title}>
      <div className="flex flex-nowrap items-center gap-x-2 p-2">
        <Input
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value },
            ])
          }
          value={currentValue || ""}
        />
        <div className="flex self-end pb-1.5">
          <Button
            hasNoBackground
            icon={IconEnum.d20}
            iconSize={24}
            isDisabled={isRolling}
            isLoading={isRolling}
            onClick={() => {
              setIsRolling(true);
              try {
                const parsedNotation = DiceRollParser.parseNotation(formula);
                DiceNoSim.roll(parsedNotation)
                  .then((r: any) => {
                    const rollData = DiceRollParser.parseFinalResults(r);
                    if (rollData?.valid) {
                      handleChange([
                        { name: `${name}.id`, value: id },
                        { name: `${name}.value`, value: rollData.value },
                      ]);
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
              setIsRolling(false);
            }}
            tooltip={`Roll (${formula})`}
          />
        </div>
      </div>
    </Collapsible>
  );
}
