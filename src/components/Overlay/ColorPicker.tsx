/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ColorPaletteType, ColorPickerType } from "../../types";
import { DefaultTagColor, TagColors } from "../../utils/enums/ColorEnums";
import { Tooltip } from ".";

function ColorPalette({ name, onChange }: ColorPaletteType) {
  return (
    <div className="flex max-h-96 max-w-xs flex-wrap gap-4 overflow-auto rounded-md bg-zinc-900 p-4 shadow">
      {TagColors.map((color) => (
        <div
          className="h-6 w-6 cursor-pointer rounded-full"
          onClick={() => onChange({ name, value: color })}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
export function ColorPicker({ name, value, onChange }: ColorPickerType) {
  return (
    <Tooltip
      arrowColor="#18181B"
      closeOnClick
      content={<ColorPalette name={name} onChange={onChange} />}
      isClickable
      isIgnoringHover>
      <div
        className="h-6 w-6 cursor-pointer rounded-full"
        style={{
          backgroundColor: value || DefaultTagColor,
        }}
      />
    </Tooltip>
  );
}
