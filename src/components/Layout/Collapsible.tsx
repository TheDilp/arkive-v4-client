/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CollapsibleType } from "../../types";
import { IconEnum } from "../../utils";
import { Button, Icon } from "..";

export function Collapsible({ label, icon, initialOpen, children, actions }: CollapsibleType) {
  return (
    <details className="cursor-default select-none" open={initialOpen}>
      <summary className="flex cursor-pointer items-center gap-x-2 border-b border-zinc-700 pb-1">
        <span className="flex select-none items-center gap-x-2 text-xl">
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
          <Icon fontSize={28} icon={IconEnum.chevron_up} />
        </span>
      </summary>
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
        {children}
      </div>
    </details>
  );
}
