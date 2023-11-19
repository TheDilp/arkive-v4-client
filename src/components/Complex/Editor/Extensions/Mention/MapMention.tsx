import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
};
export function MapMention({ title, id, label, project_id }: Props) {
  return id ? (
    <Link
      className="inline-flex font-lato font-bold underline transition-colors hover:text-sky-400"
      to={!project_id ? `/public/maps/${id}` : `/projects/${project_id}/maps/${id}`}>
      <div className="relative -top-[0.0625rem] flex items-start">
        <span className="relative">
          <Icon fontSize={14} icon={IconEnum.map} />
        </span>
        <span className="text-sm underline">{title || label}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{label}</div>
  );
}
