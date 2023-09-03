import { tv } from "tailwind-variants";

import { ButtonType } from "../../types/ComponentTypes/FormTypes";
import { IconEnum } from "../../utils/enums/IconEnum";
import { Icon, Tooltip } from "..";

const ButtonClasses = tv({
  slots: {
    base: "font-lato cursor-pointer font-medium h-10 rounded border border-transparent active:opacity-80 transition-all p-2 flex items-center justify-center gap-x-1 max-w-full w-full shadow active:shadow-none focus-visible:outline-none truncate",
    label: "hidden xs:block select-none",
  },
  variants: {
    variant: {
      primary: {
        base: "bg-zinc-900 text-white",
      },
      secondary: {
        base: "bg-zinc-600 text-white",
      },
      info: {
        base: "bg-blue-600 text-white focus:border-blue-400",
      },
      success: {
        base: "bg-green-600 text-white focus:border-green-400",
      },
      warning: { base: "bg-orange-600 text-white" },
      error: {
        base: "bg-red-600 text-white",
      },
    },
    size: {
      sm: "h-8 text-sm",
      md: "text-base",
    },
    isDisabled: {
      true: "bg-zinc-300 text-zinc-100 cursor-not-allowed",
    },
    hasNoBackground: {
      true: "bg-transparent shadow-none",
    },
    hasNoLabel: {
      true: "p-0 w-full h-full",
    },
  },
  compoundVariants: [
    {
      variant: ["primary", "secondary", "info", "success", "warning", "error"],
      isDisabled: true,
      class: "cursor-not-allowed shadow-none active:opacity-100",
    },

    {
      variant: ["secondary"],
      hasNoBackground: true,
      class: "text-zinc-700",
    },
    {
      variant: ["error"],
      hasNoBackground: true,
      class: "text-red-600",
    },

    {
      variant: ["info"],
      hasNoBackground: true,
      class: "text-blue-400",
    },
    {
      hasNoBackground: true,
      isDisabled: true,
      class: "bg-transparent",
    },
  ],
  defaultVariants: {
    variant: "primary",
  },
});

export function Button({
  label,
  icon,
  iconPos = "right",
  iconSize = 20,
  iconThickness = "regular",
  isDisabled,
  isLoading,
  variant = "primary",
  hasNoBackground,
  isIconOnly,
  onClick,
  tooltip,
  size = "md",
}: ButtonType) {
  const { base, label: labelClasses } = ButtonClasses({ variant, size, isDisabled, hasNoBackground, hasNoLabel: !label });
  return (
    <Tooltip content={tooltip || ""} isDisabled={!tooltip || isIconOnly} isIgnoringHover>
      <button className={base()} disabled={isDisabled} onClick={onClick} type="button">
        {iconPos === "left" && icon ? <Icon fontSize={iconSize} icon={icon} thickness={iconThickness} /> : null}
        {label && !isIconOnly ? <span className={labelClasses()}>{label}</span> : null}
        {(iconPos === "right" && icon) || isLoading ? (
          <Icon
            className={isLoading ? "animate-spin" : ""}
            fontSize={iconSize}
            icon={isLoading ? IconEnum.loading : icon || IconEnum.error}
            thickness={iconThickness}
          />
        ) : null}
      </button>
    </Tooltip>
  );
}
