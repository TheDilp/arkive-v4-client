import { tv } from "tailwind-variants";

import { BadgeType } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "../Form/Button";

const BadgeClasses = tv({
  base: "rounded-md h-7 px-2.5 text-sm fond-medium w-full truncate text-center flex items-center justify-center cursor-default",
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
      md: "text-sm h-full",
      lg: "text-base [&>button>*]:text-base",
    },
    hasClearAction: {
      true: "pr-1.5 gap-x-0.5",
    },
  },
});

export function Badge({ label, size = "md", variant = "primary", clearAction, customColor }: BadgeType) {
  return (
    <span
      className={BadgeClasses({ variant, hasClearAction: !!clearAction, size })}
      onClick={clearAction}
      onKeyDown={() => {}}
      role="button"
      style={{
        backgroundColor: customColor,
      }}
      tabIndex={0}>
      <span className="h-full">{label}</span>
      {clearAction ? <Button hasNoBackground icon={IconEnum.close} onClick={clearAction} /> : null}
    </span>
  );
}
