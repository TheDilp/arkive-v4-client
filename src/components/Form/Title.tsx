import { tv } from "tailwind-variants";

import { TitleType } from "../../types/ComponentTypes/FormTypes/titleTypes";

const TitleClasses = tv({
  base: "font-lato text-white",
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    isDrawerTitle: {
      true: "border-zinc-700 border-b mt-2",
    },
    variant: {
      primary: "border-zinc-400",
      secondary: "border-zinc-200",
      info: "border-blue-400",
      success: "border-green-400",
      warning: "border-warning-400",
      error: "border-red-400",
    },
  },
});

export function Title({ label, size = "md", variant = "primary", isDrawerTitle }: TitleType) {
  const classes = TitleClasses({ size, isDrawerTitle, variant });
  return <div className={classes}>{label}</div>;
}
