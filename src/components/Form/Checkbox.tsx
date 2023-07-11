import { tv } from "tailwind-variants";

import { CheckboxType } from "../../types";
import { IconEnum } from "../../utils/enums/IconEnum";
import { Icon } from "../Misc/Icon";

const CheckboxClasses = tv({
  slots: {
    base: "relative flex flex-col",
    checkbox: "flex h-6 w-6 items-center justify-center bg-zinc-900 text-white cursor-pointer rounded-md border outline-none",
    label: "text-sm font-medium truncate block",
    helperText: "text-xs truncate block",
  },
  variants: {
    variant: {
      primary: {
        checkbox: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      secondary: {
        checkbox: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        checkbox: "border-blue-600 text-blue-400",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        checkbox: "border-green-600 text-green-400",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        checkbox: "border-orange-400 text-orange-200",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        checkbox: "border-red-600 text-red-400",
        label: "text-red-500",
        helperText: "text-red-500",
      },
    },
    isDisabled: {
      true: "bg-zinc-300 text-zinc-100 cursor-not-allowed pointer-events-none",
    },
  },
  compoundVariants: [
    {
      variant: ["primary", "secondary", "info", "success", "warning", "error"],
      isDisabled: true,
      class: "bg-zinc-300 text-zinc-100 cursor-not-allowed",
    },
  ],
  defaultVariants: {
    // size: "md",
    variant: "primary",
  },
});

export function Checkbox({ label, value = false, name, helperText, onChange, variant }: CheckboxType) {
  const { base, label: labelClasses, checkbox, helperText: helperTextClasses } = CheckboxClasses({ variant, checked: value });
  return (
    <div className={base()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}

      <div
        aria-checked={value}
        className={checkbox()}
        onClick={(e) => onChange({ name, value: !value }, e)}
        onKeyDown={() => {}}
        role="checkbox"
        tabIndex={-1}>
        {value ? <Icon fontSize={18} icon={IconEnum.check} /> : null}
      </div>
      {helperText ? <span className={helperTextClasses()}>{helperText}</span> : null}
    </div>
  );
}
