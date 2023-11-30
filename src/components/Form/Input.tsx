/* eslint-disable jsx-a11y/no-autofocus */
import { tv } from "tailwind-variants";

import { InputType } from "../../types";

const InputClasses = tv({
  slots: {
    base: "relative flex flex-col font-lato w-full max-w-full",
    input:
      "flex h-10 w-full items-center justify-center bg-zinc-900 text-white focus:bg-zinc-950 rounded-md border p-2 text-base outline-none placeholder:italic",
    label: "text-sm truncate block min-h-[20px]",
    helperText: "text-xs",
  },
  variants: {
    variant: {
      primary: {
        input: "border-zinc-700 focus:border-zinc-500",
        label: "text-zinc-300",
        helperText: "text-zinc-400",
      },
      secondary: {
        input: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        input: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        input: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        input: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        input: "border-red-600",
        label: "text-red-500",
        helperText: "text-red-500",
      },
    },
    size: {
      sm: {
        input: "h-8",
      },
      xs: {
        input: "h-6",
      },
    },
    isDisabled: {
      true: {
        base: "cursor-not-allowed select-none",
        input: "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none select-none",
      },
    },
    isReadOnly: {
      true: {
        base: "cursor-not-allowed",
        input: "cursor-not-allowed pointer-events-none",
      },
    },
    isInline: {
      true: {
        input: "rounded-none border-none",
      },
    },
  },
});

function handleNumberChange({
  name,
  newValue,
  min,
  max,
  onChange,
}: {
  newValue: number;
} & Pick<InputType, "onChange" | "min" | "max" | "name">) {
  if (max && newValue > max) return;
  if (min && newValue < min) return;

  if (Number.isNaN(newValue)) {
    onChange({ name, value: null });
    return;
  }
  onChange({ name, value: newValue });
}

export function Input({
  name,
  value,
  onChange,
  onKeyDown,
  onBlur,
  isDisabled,
  isReadOnly,
  placeholder,
  type = "text",
  variant = "primary",
  size = "md",
  label,
  helperText,
  min,
  max,
  isInline,
  isAutofocused,
  step,
}: InputType) {
  const {
    base,
    input,
    label: labelClasses,
    helperText: helperTextClasses,
  } = InputClasses({ variant, size, isDisabled, isReadOnly, isInline });
  return (
    <div className={base()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}

      <input
        autoComplete="off"
        autoFocus={isAutofocused}
        className={input()}
        disabled={isDisabled || isReadOnly}
        max={max}
        min={min}
        name={name}
        onBlur={onBlur}
        onChange={(e) =>
          type === "number"
            ? handleNumberChange({ name, newValue: e.target.valueAsNumber, min, max, onChange })
            : onChange(e.target)
        }
        onKeyDown={(e) => {
          if ((e.key === "e" || e.key === "E" || e.key === "+") && type === "number") {
            e.preventDefault();
          }
          if (onKeyDown) onKeyDown(e);
        }}
        placeholder={placeholder}
        step={step}
        type={type}
        value={value}
      />
      {helperText ? <div className={helperTextClasses()}>{helperText}</div> : null}
    </div>
  );
}
