import { ButtonGroupType } from "../../types";
import { getButtonGroupVariant } from "../../utils";
import { Button } from "./Button";

export function ButtonGroup({ buttons, value, size }: ButtonGroupType) {
  return (
    <div
      className="inline-flex divide-zinc-500 shadow [&>button:first-child]:rounded-l [&>button:first-child]:rounded-r-none [&>button:last-child]:rounded-l-none [&>button:last-child]:rounded-r [&>button:not(:first-child)]:border-l [&>button]:rounded-none [&>button]:shadow-none"
      role="group">
      {buttons.map((button) => (
        <Button
          {...button}
          key={button?.label || button?.icon}
          size={size || button.size}
          variant={getButtonGroupVariant(button.variant || "primary", button.label || "", value)}
        />
      ))}
    </div>
  );
}
