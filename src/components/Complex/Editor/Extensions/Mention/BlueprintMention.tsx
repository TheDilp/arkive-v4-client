import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  nodeId: string | undefined;
  nodeLabel: string;
  project_id: string | undefined;
  icon?: string;
  parent_id?: string;
};
export function BlueprintMention({ nodeId, project_id, title, nodeLabel, icon, parent_id }: Props) {
  return nodeId ? (
    <Link
      className="inline-flex items-center font-lato font-bold underline transition-colors hover:text-sky-400"
      to={
        !project_id ? `/public/blueprints/${parent_id}/${nodeId}` : `/projects/${project_id}/blueprints/${parent_id}/${nodeId}`
      }>
      <div className="relative -top-[0.0625rem] flex items-start">
        <span className="relative">
          <Icon fontSize={14} icon={icon ?? IconEnum.blueprint} />
        </span>
        <span className="text-sm underline">{title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{nodeLabel}</div>
  );
}
