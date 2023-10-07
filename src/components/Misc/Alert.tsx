import { tv } from "tailwind-variants";

import { AlertType } from "../../types";
import { getDefaultAlertVariantIcon } from "../../utils/ui/alertUtils";
import { Icon } from "./Icon";

const AlertClasses = tv({
  slots: {
    base: "flex items-center p-2 bg-zinc-900 overflow-hidden rounded",
    label: "ml-3 text-base font-medium",
    icon: "text-xl",
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

export function Alert({ label, variant = "info" }: AlertType) {
  const { base, label: labelClasses, icon: iconClasses } = AlertClasses({ variant });
  return (
    <div className={base()} role="alert">
      <div className={iconClasses()}>
        <Icon icon={getDefaultAlertVariantIcon(variant)} />
      </div>
      <div className={labelClasses()}>{label}</div>
    </div>
  );
}
