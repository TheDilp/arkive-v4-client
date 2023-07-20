/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from "react";

import { ColorPaletteType, ColorPickerType } from "../../types";
import { validateHexCode } from "../../utils";
import { DefaultTagColor, TagColors } from "../../utils/enums/ColorEnums";
import { Input } from "..";
import { Tooltip } from ".";

function ColorPalette({ name, hasCustom, onChange }: ColorPaletteType) {
  const [customColor, setCustomColor] = useState(DefaultTagColor);
  return (
    <div className="flex max-h-96 max-w-xs flex-col overflow-hidden rounded-md border border-zinc-700 bg-zinc-900">
      {hasCustom ? (
        <div className="sticky top-0 flex w-full items-center gap-x-2 bg-zinc-900 py-2 pl-4 pr-5">
          <div
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            <Input
              helperText={validateHexCode(customColor) ? "" : "This is not a valid hex code."}
              label="Custom color"
              name="customColor"
              onChange={(e) => {
                const newHex = (e.value as string).replace("#", "");
                if (newHex.length > 6) return;
                setCustomColor(`#${newHex}`);
              }}
              placeholder="Custom hex code (Eg. #fffccc)"
              value={customColor}
              variant={validateHexCode(customColor) ? "primary" : "error"}
            />
          </div>
          <input
            className="mt-7 self-start"
            color="hex"
            onChange={(e) => {
              setCustomColor(e.target.value);
            }}
            type="color"
            value={customColor}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap justify-between gap-4 overflow-auto  p-4 shadow">
        {TagColors.map((color) => (
          <div
            key={color}
            className="h-6 w-6 cursor-pointer rounded-full"
            onClick={() => onChange({ name, value: color })}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
export function ColorPicker({ name, value, hasCustom, onChange }: ColorPickerType) {
  return (
    <Tooltip arrowColor="#18181B" content={<ColorPalette hasCustom={hasCustom} name={name} onChange={onChange} />} isClickable>
      <div
        className="h-6 w-6 cursor-pointer rounded-full"
        style={{
          backgroundColor: value || DefaultTagColor,
        }}
      />
    </Tooltip>
  );
}
