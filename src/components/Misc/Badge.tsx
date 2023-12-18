import { tv } from "tailwind-variants";

import { BadgeType } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "../Form/Button";

const BadgeClasses = tv({
  base: "rounded h-6 px-1.5 text-sm fond-medium w-full text-center flex items-center justify-center",
  variants: {
    variant: {
      primary: "bg-zinc-950 text-white",
      secondary: "bg-zinc-600 text-white",
      info: "bg-blue-600 text-white",
      success: "bg-green-600 text-white",
      warning: "bg-orange-600 text-white",
      error: "bg-red-600 text-white",
    },
    size: {
      sm: "text-xs h-full",
      md: "text-sm h-full",
      lg: "text-base [&>button>*]:text-base",
    },
    hasClearAction: {
      true: "pr-1.5 gap-x-0.5",
    },
    isColorWhite: {
      true: "text-black",
    },
  },
});

export function Badge({ label, size = "md", variant = "primary", clearAction, customColor }: BadgeType) {
  return (
    <span
      className={BadgeClasses({ variant, hasClearAction: !!clearAction, size, isColorWhite: customColor === "#ffffff" })}
      onKeyDown={() => {}}
      role="button"
      style={{
        backgroundColor: customColor,
      }}
      tabIndex={-1}>
      <span className="w-full truncate">{label}</span>
      {clearAction ? (
        <div className="w-min">
          <Button
            hasNoBackground
            icon={IconEnum.close}
            isIconOnly
            onClick={clearAction}
            variant={customColor === "#ffffff" ? "secondary" : "primary"}
          />
        </div>
      ) : null}
    </span>
  );
}
