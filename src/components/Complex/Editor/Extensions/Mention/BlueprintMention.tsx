import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetSubEntity } from "../../../../../hooks";
import { BlueprintInstanceType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  icon?: string;
  parent_id?: string;
  isPublic?: boolean;
};
export function BlueprintMention({ id, project_id, title, label, icon, parent_id, isPublic }: Props) {
  const { data } = useGetSubEntity<BlueprintInstanceType>(
    id as string,
    "blueprint_instances",
    {
      data: {
        id,
      },
      fields: ["id", "title", "is_public"],
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );
  if (data?.data && (data?.data?.is_public || !isPublic))
    return (
      <Link
        className="inline-flex items-center font-lato font-bold underline transition-colors hover:text-sky-400"
        to={getMentionLink(
          id as string,
          "blueprint_instances",
          project_id as string,
          data?.data?.is_public ?? false,
          isPublic,
          parent_id,
        )}>
        <div className="relative -top-[0.0625rem] flex items-start">
          <span className="relative">
            <Icon fontSize={14} icon={icon ?? IconEnum.blueprint} />
          </span>
          <span className="text-sm underline">{title || label}</span>
        </div>
      </Link>
    );
  return <span className="font-lato text-sm">{label}</span>;
}
