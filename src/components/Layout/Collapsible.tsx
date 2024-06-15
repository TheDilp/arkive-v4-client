import { useState } from "react";
import { tv } from "tailwind-variants";

import { CollapsibleType, Size } from "../../types";
import { AvailableIcons, IconEnum } from "../../utils";
import { Button, Icon } from "..";

const CollapsibleClasses = tv({
  slots: {
    label: "flex select-none items-center gap-x-2 text-white",
    summary:
      "cursor-pointer flex items-center gap-x-2 border-b pb-1 font-lato outline-none focus:border-blue-400 focus:border-zinc-400",
  },
  variants: {
    variant: {
      primary: {
        label: "text-white",
        summary: "border-zinc-700",
      },
      error: {
        label: "text-red-600",
        summary: "border-red-700",
      },
    },
    isDisabled: {
      true: {
        summary: "cursor-not-allowed text-zinc-600",
      },
      false: {
        summary: "cursor-pointer",
      },
    },
    size: {
      md: {
        label: "text-base",
      },
      lg: {
        label: "text-lg",
      },
      xl: {
        label: "text-xl",
      },
    },
  },
});

function getIconSize(size: Size) {
  if (size === "xl") return 28;
  if (size === "lg") return 24;
  if (size === "md") return 20;
  return 24;
}

export function Collapsible({
  label,
  icon,
  initialOpen,
  isDisabled,
  children,
  actions,
  size = "xl",
  variant = "primary",
}: CollapsibleType) {
  const { label: labelClasses, summary: summaryClasses } = CollapsibleClasses({
    variant,
    size,
    isDisabled,
  });
  const [open, setOpen] = useState<boolean>(initialOpen ?? false);
  return (
    <details
      className="cursor-default select-none"
      onClick={(e) => {
        e.preventDefault();
        if (isDisabled) return;
        setOpen((prev) => !prev);
      }}
      open={open}>
      <summary className={summaryClasses()}>
        <span className={labelClasses()}>
          {icon ? (
            <span className="no-rotate">
              <Icon icon={icon as AvailableIcons} />
            </span>
          ) : null}
          {label}
        </span>
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
                    isDisabled={act?.isDisabled}
                    label={act?.label}
                    onClick={act.onClick}
                    tooltip={act?.tooltip}
                    variant={act?.variant}
                  />
                </div>
              ))
            : null}
          <Icon fontSize={getIconSize(size)} icon={IconEnum.chevron_up} />
        </span>
      </summary>
      {open ? (
        <div className="rounded-b bg-zinc-950" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      ) : null}
    </details>
  );
}
