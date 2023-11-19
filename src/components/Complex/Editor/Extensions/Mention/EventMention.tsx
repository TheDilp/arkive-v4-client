/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetSubEntity } from "../../../../../hooks";
import { EventType } from "../../../../../types";
import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  nodeId: string | undefined;
  nodeLabel: string;
  project_id: string | undefined;
  parent_id?: string;
  isPublic?: boolean;
};
export function EventMention({ nodeId, project_id, title, nodeLabel, isPublic, parent_id }: Props) {
  const { data } = useGetSubEntity<EventType>(
    nodeId,
    "events",
    {
      fields: ["id", "title", "parent_id"],
    },
    { enabled: !!nodeId, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"] },
  );

  return nodeId ? (
    <Link
      className="inline-flex items-center font-lato font-bold underline transition-colors"
      to={isPublic ? `/public/calendars/${parent_id}/${nodeId}` : `/projects/${project_id}/calendars/${parent_id}/${nodeId}`}>
      <div className={`relative ${isPublic ? "top-[0.175rem]" : "top-[0.025rem]"} flex items-start`}>
        <span className="relative top-0.5">
          <Icon fontSize={14} icon={IconEnum.event} />
        </span>
        <span className="text-sm underline hover:text-sky-400">{data?.data?.title || title || nodeLabel}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{nodeLabel}</div>
  );
}
