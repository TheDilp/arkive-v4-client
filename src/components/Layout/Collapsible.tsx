/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CollapsibleType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from "..";

export function Collapsible({ label, children }: CollapsibleType) {
  return (
    <details className="select-none">
      <summary className="flex items-center gap-x-2 border-b border-zinc-700 pb-1 ">
        <span className="select-none text-xl">{label}</span>
        <span className="ml-auto">
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
