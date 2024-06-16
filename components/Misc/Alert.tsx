import { tv } from "tailwind-variants";

import { AlertType } from "../../types";
import { getDefaultAlertVariantIcon } from "../../utils/ui/alertUtils";
import { Icon } from "./Icon";

const AlertClasses = tv({
  slots: {
    base: "flex items-center p-2 bg-zinc-800 overflow-hidden rounded",
    label: "ml-3 text-base font-medium",
    icon: "text-xl",
  },
  variants: {
    variant: {
      info: {
        base: "text-blue-400",
      },
      success: {
        base: "text-green-400",
      },
      "success-bordered": {
        base: "border-green-400 border text-green-400 bg-transparent",
      },
      "info-bordered": "border-blue-400 border text-blue-400 bg-transparent",
      warning: {
        base: "text-orange-600",
      },
      "warning-bordered": "border-orange-600 border text-orange-600 bg-transparent",
      error: {
        base: "text-red-600",
      },
      "error-bordered": "border-red-600 border text-red-600 bg-transparent",
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
