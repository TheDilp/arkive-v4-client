/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from "react";
import { tv } from "tailwind-variants";

import { CollapsibleType } from "../../types";
import { IconEnum } from "../../utils";
import { Button, Icon } from "..";

const CollapsibleClasses = tv({
  slots: {
    label: "flex select-none items-center gap-x-2",
    summary: "cursor-pointer flex items-center gap-x-2 border-b border-zinc-700 pb-1 font-lato",
  },
  variants: {
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

export function Collapsible({ label, icon, initialOpen, isDisabled, children, actions, size = "xl" }: CollapsibleType) {
  const { label: labelClasses, summary: summaryClasses } = CollapsibleClasses({ size, isDisabled });
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
              <Icon icon={icon} />
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
                    label={act?.label}
                    onClick={act.onClick}
                    tooltip={act?.tooltip}
                    variant={act?.variant}
                  />
                </div>
              ))
            : null}
          <Icon fontSize={24} icon={IconEnum.chevron_up} />
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
