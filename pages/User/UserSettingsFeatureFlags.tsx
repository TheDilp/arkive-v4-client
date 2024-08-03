import { useAtomValue } from "jotai";
import ls from "localstorage-slim";
import { useEffect, useState } from "react";

import { Button, Checkbox, ColorPicker, Select } from "../../components";
import { useHandleChange, useUpdateUser } from "../../hooks";
import {
  capitalizeFirstLetter,
  DefaultTagColor,
  DefaultUserFeatureFlags,
  Dice,
  DiceRollParser,
  DiceThemes,
  IconEnum,
  userAtom,
} from "../../utils";

export function UserSettingsFeatureFlags() {
  const user = useAtomValue(userAtom);
  const defaultDiceColor = ls.get("default_dice_color");
  const [color, setColor] = useState((defaultDiceColor as string | undefined) || DefaultTagColor);
  const { mutate: updateUser } = useUpdateUser(user?.id as string);

  const savedTheme = user?.feature_flags?.diceTheme || "default";
  const [featureFlags, setFeatureFlags] = useState<Record<string, string | boolean>>({});

  const { handleChange } = useHandleChange({ data: featureFlags, setData: setFeatureFlags });

  useEffect(() => {
    if (user) {
      setFeatureFlags(user?.feature_flags);
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="mt-2 w-fit self-end">
        <Button
          icon={IconEnum.save}
          label="Save"
          onClick={() =>
            updateUser({
              data: {
                feature_flags: featureFlags,
              },
            })
          }
          variant="success"
        />
      </div>
      <div className="flex flex-col bg-zinc-900">
        {DefaultUserFeatureFlags.map((entity) => (
          <div
            className="flex flex-nowrap items-center justify-between border-t border-zinc-700 p-2 first:border-t-0 hover:bg-zinc-800"
            key={entity}>
            <span>{capitalizeFirstLetter(entity.replaceAll("_", " "))}</span>
            {entity === "dice_theme" ? (
              <div className="flex w-64 items-center gap-x-2">
                <Select
                  name="dice_theme"
                  onChange={handleChange}
                  options={DiceThemes}
                  value={(featureFlags?.[entity] as string | undefined) || "default"}
                />
                <div>
                  <ColorPicker name={"color"} onChange={({ value }) => setColor(value)} value={color} />
                </div>
                <div className="flex self-end pb-1.5">
                  <Button
                    hasNoBackground
                    icon={IconEnum.d20}
                    iconSize={24}
                    onClick={() => {
                      try {
                        const parsedNotation = DiceRollParser.parseNotation("d100 + d20 + d12 + d10 + d8 + d6 + d4");
                        Dice.updateConfig({
                          theme: featureFlags?.[entity],
                          themeColor: color,
                          suspendSimulation: false,
                        });

                        Dice.roll(parsedNotation).then(() => {
                          Dice.updateConfig({
                            theme: savedTheme,
                            themeColor: defaultDiceColor || DefaultTagColor,
                          });
                        });
                      } catch (error) {
                        //
                      }
                    }}
                    tooltip="Test dice"
                  />
                </div>
              </div>
            ) : (
              <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                <Checkbox
                  label="Enabled"
                  name={entity}
                  onChange={handleChange}
                  value={typeof featureFlags?.[entity] === "boolean" ? featureFlags?.[entity] : false}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
