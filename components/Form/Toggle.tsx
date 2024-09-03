import { tv } from "tailwind-variants";

import { ToggleComponentType } from "../../types/ComponentTypes/FormTypes/toggleTypes";
import { IconEnum } from "../../utils";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

const classes = tv({
  slots: {
    input:
      "caret-transparent peer sr-only [&:checked_+_span_div[data-checked-icon]]:block [&:checked_+_span_div[data-unchecked-icon]]:hidden",
    label:
      "relative inline-block cursor-pointer rounded-full [&:has(:checked_+_span_div[data-checked-icon])]:bg-green-600 bg-zinc-700 transition [-webkit-tap-highlight-color:_transparent]",
    buttonContainer:
      "absolute inset-y-0 start-0 z-10 inline-flex size-6 items-center justify-center rounded-full peer-checked:bg-zinc-600 text-zinc-800 transition-all bg-zinc-500 peer-checked:start-6 peer-checked:text-white",
    icon: "size-4 top-0 relative",
  },
  variants: {
    size: {
      sm: {
        label: "h-4 w-10",
        buttonContainer: "size-4 m-0",
        icon: "size-2 text-[12px] relative -top-0.5 -left-0.5",
      },
      md: {
        label: "h-6 w-12",
      },
    },
  },
});

export function Toggle({
  size = "md",
  offIcon = IconEnum.close,
  onIcon = IconEnum.check,
  value = false,
  tooltip,
  allowedPlacements = [],
  name,
  onChange,
}: ToggleComponentType) {
  const { input, label, buttonContainer, icon: iconClasses } = classes({ size });
  return (
    <Tooltip allowedPlacements={allowedPlacements} content={tooltip || ""} isDisabled={!tooltip}>
      <label className={label()}>
        <input checked={value} className={input()} name={name} onChange={(e) => onChange(e.target)} type="checkbox" />

        <span className={buttonContainer()}>
          <div className={iconClasses()} data-unchecked-icon>
            <Icon icon={offIcon} />
          </div>

          <div className={`hidden ${iconClasses()}`} data-checked-icon>
            <Icon icon={onIcon} />
          </div>
        </span>
      </label>
    </Tooltip>
  );
}
