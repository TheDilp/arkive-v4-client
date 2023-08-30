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
  },
});

export function Title({ label, size, isDrawerTitle }: TitleType) {
  const classes = TitleClasses({ size, isDrawerTitle });
  return <div className={classes}>{label}</div>;
}
