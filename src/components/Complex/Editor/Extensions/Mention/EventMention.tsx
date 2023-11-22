import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetSubEntity } from "../../../../../hooks";
import { EventType } from "../../../../../types";
import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  parent_id?: string;
  isPublic?: boolean;
};
export function EventMention({ id, project_id, title, label, isPublic, parent_id }: Props) {
  const { data } = useGetSubEntity<EventType>(
    id,
    "events",
    {
      fields: ["id", "title", "parent_id"],
    },
    { enabled: !!id, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"] },
  );

  return id ? (
    <Link
      className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
      to={isPublic ? `/public/calendars/${parent_id}/${id}` : `/projects/${project_id}/calendars/${parent_id}/${id}`}>
      <div className="top-[0.025rem] flex items-start">
        <span className="relative top-0.5">
          <Icon fontSize={15} icon={IconEnum.event} />
        </span>
        <span className="text-sm underline hover:text-sky-400">{data?.data?.title || title || label}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{label}</div>
  );
}
