import { tv } from "tailwind-variants";

import { TitleType } from "../../types/ComponentTypes/FormTypes/titleTypes";
import { Button } from "./Button";

const TitleClasses = tv({
  slots: {
    base: "font-lato text-white flex flex-nowrap justify-between",
    actions: "flex flex-nowrap gap-x-1",
  },
  variants: {
    size: {
      "4xs": "text-xs",
      "3xs": "text-xs",
      "2xs": "text-xs",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    isDrawerTitle: {
      true: "border-zinc-700 border-b mt-2",
    },
    variant: {
      primary: "border-zinc-800",
      secondary: "border-zinc-200",
      info: "border-blue-400",
      success: "border-green-400",
      warning: "border-warning-400",
      error: "border-red-400",
      "primary-bordered": "",
      "secondary-bordered": "",
      "info-bordered": "",
      "success-bordered": "",
      "warning-bordered": "",
      "error-bordered": "",
    },
  },
});

export function Title({ label, size = "md", actions, variant = "primary", isDrawerTitle }: TitleType) {
  const { base, actions: actionsClasses } = TitleClasses({ size, isDrawerTitle, variant });
  return (
    <div className={base()}>
      <span>{label}</span>
      <div className={actionsClasses()}>
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
                  isDisabled={act?.isDisabled}
                  label={act?.label}
                  onClick={act.onClick}
                  tooltip={act?.tooltip}
                  variant={act?.variant}
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
