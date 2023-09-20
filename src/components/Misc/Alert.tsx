import { tv } from "tailwind-variants";

import { AlertType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from "./Icon";

const AlertClasses = tv({
  slots: {
    base: "flex items-center p-4 bg-zinc-900 overflow-hidden rounded",
    label: "ml-3 text-sm font-medium",
  },
  variants: {
    variant: {
      info: {
        base: "text-blue-400",
      },
      warning: {
        base: "text-orange-400",
      },
      error: {
        base: "text-red-600",
      },
    },
  },
});

export function Alert({ label, variant = "primary" }: AlertType) {
  const { base, label: labelClasses } = AlertClasses({ variant });
  return (
    <div className={base()} role="alert">
      <div>
        <Icon icon={IconEnum.info_circle} />
      </div>
      <div className={labelClasses()}>{label}</div>
    </div>
  );
}
