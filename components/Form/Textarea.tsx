import { tv } from "tailwind-variants";

import { TextareaType } from "../../types";

const TextareaClasses = tv({
  slots: {
    base: "relative flex h-full min-h-full flex-col font-lato",
    textarea:
      "flex h-full w-full resize-none items-center justify-center bg-zinc-950 text-white focus:bg-zinc-800 rounded-md border p-2 text-base outline-none placeholder:text-sm placeholder:italic",
    label: "text-sm font-medium truncate block pl-1 min-h-[20px]",
    helperText: "text-xs truncate block min-h-4",
  },
  variants: {
    variant: {
      primary: {
        textarea: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      secondary: {
        textarea: "border-zinc-600",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        textarea: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        textarea: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        textarea: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        textarea: "border-red-600",
        label: "text-red-500",
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
      "4xs": {},
      "3xs": {},
      "2xs": {},
      xs: {},
      sm: {
        textarea: "h-8",
      },
      md: {},
      lg: {},
      xl: {},
      "2xl": {},
      "3xl": {},
      "4xl": {},
    },
    isDisabled: {
      true: {
        textarea: "bg-zinc-700 text-zinc-100 cursor-not-allowed",
      },
    },
    isResizable: {
      true: {
        textarea: "resize-y",
      },
    },
    isReadOnly: {
      true: {
        base: "cursor-not-allowed",
        textarea: "cursor-not-allowed pointer-events-none",
      },
    },
    hasNoBackground: {
      true: {
        textarea: "bg-transparent bg-none text-white border-none",
      },
    },
  },
});

export function Textarea({
  name,
  onChange,
  label,
  value,
  placeholder,
  helperText,
  size = "md",
  variant = "primary",
  isResizable = false,
  isDisabled,
  isReadOnly,
  hasNoBackground,
  maxLength,
}: TextareaType) {
  const {
    base,
    textarea,
    label: labelClasses,
    helperText: helperTextClasses,
  } = TextareaClasses({ size, variant, isResizable, isDisabled, hasNoBackground, isReadOnly });
  return (
    <div className={base()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}

      <textarea
        className={textarea()}
        disabled={isDisabled || isReadOnly}
        maxLength={maxLength}
        name={name}
        onChange={(e) => onChange(e.target)}
        placeholder={placeholder}
        value={value}
      />
      {helperText ? <span className={helperTextClasses()}>{helperText}</span> : null}
    </div>
  );
}
