/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CollapsibleType } from "../../types";
import { IconEnum } from "../../utils";
import { Button, Icon } from "..";

export function Collapsible({ label, children, actions }: CollapsibleType) {
  return (
    <details className="select-none">
      <summary className="flex items-center gap-x-2 border-b border-zinc-700 pb-1 ">
        <span className="select-none text-xl">{label}</span>
        <span className="ml-auto">
          <Icon fontSize={28} icon={IconEnum.chevron_up} />
        </span>
        {actions?.length
          ? actions.map((act) => (
              <div key={act.label || act.icon}>
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
