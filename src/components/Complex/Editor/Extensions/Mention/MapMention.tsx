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
      className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
      to={!project_id ? `/public/maps/${id}` : `/projects/${project_id}/maps/${id}`}>
      <div className="top-[0.025rem] flex items-start">
        <span className="relative top-0.5">
          <Icon fontSize={15} icon={IconEnum.map} />
        </span>
        <span className="text-sm underline">{title || label}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{label}</div>
  );
}
