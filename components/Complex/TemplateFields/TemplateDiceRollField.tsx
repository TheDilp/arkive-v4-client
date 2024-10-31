import ls from "localstorage-slim";
import { useState } from "react";

import { HandleChangePropsType } from "../../../types";
import { DefaultTagColor, Dice, DiceRollParser, IconEnum, useNotifications } from "../../../utils";
import { Button, Input } from "../../Form";
import { FormFieldContainer, TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  formula: string;
  currentValue: string | number | null;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isDrawer?: boolean;
  isOpen?: boolean;
};
const defaultDiceColor = ls.get("default_dice_color");

export function TemplateDiceRollField({
  title,
  isDisabled,
  name,
  formula,
  handleChange,
  id,
  isOpen,
  currentValue,
  isCollapsible,
  isDrawer,
}: Props) {
  const createNotification = useNotifications();
  const [isRolling, setIsRolling] = useState(false);
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <FormFieldContainer isDrawer={isDrawer}>
        <div className="flex flex-nowrap items-center justify-between">
          <Input
            isDisabled={isDisabled}
            label={title}
            name={name}
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.value`, value },
              ])
            }
            value={currentValue || ""}
            variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
          />
          <div className="flex self-end pb-1.5">
            <Button
              hasNoBackground
              icon={IconEnum.d20}
              iconSize={24}
              isDisabled={isRolling || isDisabled}
              isLoading={isRolling}
              onClick={() => {
                setIsRolling(true);
                try {
                  const parsedNotation = DiceRollParser.parseNotation(formula);
                  Dice.updateConfig({
                    themeColor: defaultDiceColor || DefaultTagColor,
                    suspendSimulation: IS_GATEWAY ? false : true,
                  });

                  Dice.roll(parsedNotation)
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
                  Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor, suspendSimulation: false });
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
      </FormFieldContainer>
    </TemplateFieldContainer>
  );
}
