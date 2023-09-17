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
      className="inline-flex items-center font-lato text-sm font-bold text-white underline transition-colors hover:text-sky-400"
      to={!project_id ? `/view/characters/${nodeId}` : `/projects/${project_id}/characters/${nodeId}`}>
      <Icon fontSize={15} icon={IconEnum.character} />
      {title || nodeLabel}
    </Link>
  ) : (
    <div className="Lato text-white">{nodeLabel}</div>
  );
}
