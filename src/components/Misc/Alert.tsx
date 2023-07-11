import { tv } from "tailwind-variants";

import { AlertType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from "./Icon";

const AlertClasses = tv({
  slots: {
    base: "flex items-center p-4 bg-zinc-900 overflow-hidden rounded",
  },
  variants: {
    variant: {
      info: {
        base: "border-blue-600 text-blue-400",
      },
    },
  },
});

export default function Alert({ label, variant = "primary" }: AlertType) {
  const { base } = AlertClasses({ variant });
  return (
    <div className={base()} role="alert">
      <Icon icon={IconEnum.info_circle} />
      <div className="ml-3 text-sm font-medium">{label}</div>
    </div>
  );
}
