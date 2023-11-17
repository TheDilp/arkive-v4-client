import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { CharacterType } from "../../../../../types";
import { getImageURL, IconEnum } from "../../../../../utils";
import { Avatar } from "../../../../Misc";

type Props = {
  title?: string;
  nodeId: string | undefined;
  nodeLabel: string;
  project_id: string | undefined;
};
export function CharacterMention({ nodeId, project_id, title, nodeLabel }: Props) {
  const { data } = useGetEntity<CharacterType>(
    nodeId,
    "characters",
    {
      fields: ["id", "full_name", "portrait_id"],
    },
    { enabled: !!nodeId, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"] },
  );

  return nodeId ? (
    <Link
      className="inline-flex items-center font-lato font-bold underline transition-colors hover:text-sky-400"
      to={!project_id ? `/public/characters/${nodeId}/resources` : `/projects/${project_id}/characters/${nodeId}/resources`}>
      <div className="relative -top-[0.0625rem] flex items-start">
        <span className="characterMentionImage relative">
          {data?.data?.portrait_id ? (
            <Avatar image={getImageURL(project_id as string, "images", data?.data?.portrait_id)} size="xxs" />
          ) : (
            <Icon fontSize={14} icon={IconEnum.character} />
          )}
        </span>
        <span className="text-sm underline">{data?.data?.full_name || title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{nodeLabel}</div>
  );
}
