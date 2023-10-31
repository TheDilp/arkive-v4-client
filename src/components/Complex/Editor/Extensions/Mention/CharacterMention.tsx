import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  nodeId: string | undefined;
  nodeLabel: string;
  project_id: string | undefined;
};
export function CharacterMention({ nodeId, project_id, title, nodeLabel }: Props) {
  return nodeId ? (
    <Link
      className="inline-flex items-center font-lato font-bold text-white underline transition-colors hover:text-sky-400"
      to={!project_id ? `/view/characters/${nodeId}/resources` : `/projects/${project_id}/characters/${nodeId}/resources`}>
      <div className="flex items-start">
        <span className="relative top-0.5">
          <Icon fontSize={16} icon={IconEnum.character} />
        </span>
        <span className="text-sm underline">{title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="Lato text-sm text-white">{nodeLabel}</div>
  );
}
