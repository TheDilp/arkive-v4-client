import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  icon?: string;
  parent_id?: string;
};
export function BlueprintMention({ id, project_id, title, label, icon, parent_id }: Props) {
  return id ? (
    <Link
      className="inline-flex items-center font-lato font-bold underline transition-colors hover:text-sky-400"
      to={!project_id ? `/public/blueprints/${parent_id}/${id}` : `/projects/${project_id}/blueprints/${parent_id}/${id}`}>
      <div className="relative -top-[0.0625rem] flex items-start">
        <span className="relative">
          <Icon fontSize={14} icon={icon ?? IconEnum.blueprint} />
        </span>
        <span className="text-sm underline">{title || label}</span>
      </div>
    </Link>
  ) : (
    <div className="font-lato text-sm">{label}</div>
  );
}
