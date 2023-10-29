/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { tv } from "tailwind-variants";

import { TitleType } from "../../types/ComponentTypes/FormTypes/titleTypes";
import { Button } from "./Button";

const TitleClasses = tv({
  base: "font-lato text-white flex items-center justify-between",
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

export function Title({ label, size = "md", isDrawerTitle, actions }: TitleType) {
  const classes = TitleClasses({ size, isDrawerTitle });
  return (
    <div className={classes}>
      {label}
      <span className="ml-auto flex flex-nowrap gap-x-1">
        {actions?.length
          ? actions.map((act) => (
              <div
                key={act.label || act.icon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                <Button
                  hasNoBackground
                  icon={act?.icon}
                  label={act?.label}
                  onClick={act.onClick}
                  tooltip={act?.tooltip}
                  variant={act?.variant}
                />
              </div>
            ))
          : null}
      </span>
    </div>
  );
}
