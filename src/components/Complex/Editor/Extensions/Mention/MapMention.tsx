import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  nodeId: string | undefined;
  nodeLabel: string;
  project_id: string | undefined;
};
export function MapMention({ title, nodeId, nodeLabel, project_id }: Props) {
  return nodeId ? (
    <Link
      className="inline-flex font-lato font-bold underline transition-colors hover:text-sky-400"
      to={!project_id ? `/public/maps/${nodeId}` : `/projects/${project_id}/maps/${nodeId}`}>
      <div className="relative -top-[0.0625rem] flex items-start">
        <span className="relative">
          <Icon fontSize={14} icon={IconEnum.map} />
        </span>
        <span className="text-sm underline">{title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{nodeLabel}</div>
  );
}
