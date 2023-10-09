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
      className="inline-flex font-lato font-bold text-white underline transition-colors hover:text-sky-400"
      to={!project_id ? `/view/maps/${nodeId}` : `/projects/${project_id}/maps/${nodeId}`}>
      <div className="flex items-start">
        <span className="relative top-0.5">
          <Icon fontSize={16} icon={IconEnum.map} />
        </span>
        <span className="underline">{title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="Lato text-white">{nodeLabel}</div>
  );
}
