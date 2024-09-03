import { tv } from "tailwind-variants";

import { InputType } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "./Button";

const InputClasses = tv({
  slots: {
    base: "relative flex flex-col font-lato w-full max-w-full",
    inputContainer:
      "flex items-center h-10 bg-zinc-950 text-white [&:has(:focus)]:bg-black rounded-md border p-2 text-base outline-none",
    input: "flex w-full items-center justify-center placeholder:italic fill-white bg-transparent outline-none",
    label: "text-sm truncate block min-h-[20px]",
    helperText: "text-xs",
  },
  variants: {
    variant: {
      primary: {
        inputContainer: "border-zinc-800 [&:has(:focus)]:border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-400",
      },
      secondary: {
        inputContainer: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        inputContainer: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        inputContainer: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        inputContainer: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        inputContainer: "border-red-700",
        label: "text-red-600",
        helperText: "text-red-500",
      },
      "primary-bordered": {},
      "secondary-bordered": {},
      "info-bordered": {},
      "success-bordered": {},
      "warning-bordered": {},
      "error-bordered": {},
    },
    size: {
      "4xs": {
        inputContainer: "h-6",
      },
      "3xs": {
        inputContainer: "h-6",
      },
      "2xs": {
        inputContainer: "h-6",
      },
      xs: {
        inputContainer: "h-6",
      },
      sm: {
        inputContainer: "h-8",
      },
      md: { inputContainer: "h-10" },
      lg: {
        inputContainer: "h-12 text-2xl",
      },
      xl: { inputContainer: "h-14" },
      "2xl": { inputContainer: "h-16" },
      "3xl": {},
      "4xl": {},
    },
    isDisabled: {
      true: {
        base: "cursor-not-allowed select-none",
        inputContainer: "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none select-none",
      },
    },
    isReadOnly: {
      true: {
        base: "cursor-not-allowed",
        inputContainer: "cursor-not-allowed pointer-events-none",
        input: "truncate",
      },
    },
    isInline: {
      true: {
        inputContainer: "rounded-none border-none",
      },
    },
  },
});

function handleNumberChange({
  name,
  newValue,
  min,
  max,
  step,
  onChange,
}: {
  newValue: string;
} & Pick<InputType, "onChange" | "min" | "max" | "name" | "step">) {
  const parsed = Number(newValue);
  if (Number.isNaN(newValue)) {
    onChange({ name, value: null });
    return;
  }
  if (max && parsed > max) {
    onChange({ name, value: min });
    return;
  }
  if (min && parsed < min) {
    onChange({ name, value: min });
    return;
  }
  if (step === 1 && (parsed === null || Number.isNaN(parsed))) {
    onChange({ name, value: 1 });
    return;
  }
  onChange({ name, value: Math.abs(parsed) });
}

export function Input({
  name,
  value,
  onChange,
  onKeyDown,
  onBlur,
  isDisabled,
  isClearable,
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
  prefix,
  suffix,
}: InputType) {
  const {
    base,
    inputContainer,
    input,
    label: labelClasses,
    helperText: helperTextClasses,
  } = InputClasses({ variant, size, isDisabled, isReadOnly, isInline });

  return (
    <div className={base()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <div className={inputContainer()}>
        {prefix ? <span className="pr-1">{prefix}</span> : null}

        <input
          autoComplete="one-time-code"
          autoFocus={isAutofocused}
          className={input()}
          disabled={isDisabled || isReadOnly}
          max={max}
          maxLength={type === "code" ? 6 : undefined}
          min={min}
          name={name}
          onBlur={onBlur}
          onChange={(e) =>
            type === "number"
              ? handleNumberChange({ name, newValue: e.target.value, min, max, step, onChange })
              : onChange(e.target)
          }
          onKeyDown={(e) => {
            if (type === "number") {
              if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
                e.preventDefault();
                navigator.clipboard.readText().then((res) => {
                  const numbered = Number(res);
                  if (isNaN(numbered)) return;
                  else {
                    onChange({ name, value: numbered });
                  }
                });
              }
            }

            if ((e.key === "e" || e.key === "E" || e.key === "+") && type === "number") {
              e.preventDefault();
            } else if (e.key === "-" && type === "number" && !!value) {
              e.preventDefault();
              onChange({ name, value: -value });
            }
            if (step === 1) {
              if (e.key === "," || e.key === ".") {
                e.preventDefault();
                return;
              }
            }
            // if (type === "number")
            //   handleNumberChange({ name, newValue: e.currentTarget.valueAsNumber, min, max, step, onChange });
            if (onKeyDown) onKeyDown(e);
          }}
          placeholder={placeholder}
          step={step}
          type={type}
          value={type === "number" ? value?.toString() : value}
        />
        {suffix ? <span className="pl-1">{suffix}</span> : null}

        {(type === "search" || isClearable) && !!value ? (
          <span>
            <Button hasNoBackground icon={IconEnum.close} onClick={() => onChange({ name, value: "" })} />
          </span>
        ) : null}
      </div>

      {helperText ? <div className={helperTextClasses()}>{helperText}</div> : null}
    </div>
  );
}
