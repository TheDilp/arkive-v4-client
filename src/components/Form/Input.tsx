import { tv } from "tailwind-variants";

import { InputType } from "../../types";

const InputClasses = tv({
  slots: {
    base: "relative flex flex-col font-lato",
    input:
      "flex h-10 w-full items-center justify-center bg-zinc-900 text-white focus:bg-zinc-950 rounded-md border p-2 text-base outline-none placeholder:text-sm placeholder:italic",
    label: "text-sm font-medium truncate block pl-1 min-h-[20px]",
    helperText: "text-xs truncate block",
  },
  variants: {
    variant: {
      primary: {
        input: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
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

export function Input({
  name,
  value,
  onChange,
  onKeyDown,
  placeholder,
  type = "text",
  variant = "primary",
  size = "md",
  label,
  helperText,
}: InputType) {
  const { base, input, label: labelClasses, helperText: helperTextClasses } = InputClasses({ variant, size });
  return (
    <div className={base()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}

      <input
        className={input()}
        name={name}
        onChange={(e) => (type === "number" ? onChange({ name, value: e.target.valueAsNumber }) : onChange(e.target))}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {helperText ? <span className={helperTextClasses()}>{helperText}</span> : null}
    </div>
  );
}
