import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { MapType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  isPublic?: boolean;
};
export function MapMention({ title, id, label, project_id, isPublic }: Props) {
  const { data } = useGetEntity<MapType>(
    id as string,
    "maps",
    {
      fields: ["is_public"],
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );

  return data?.data && (data?.data?.is_public || !isPublic) ? (
    <Link
      className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
      to={getMentionLink(id as string, "maps", project_id as string, !!data?.data?.is_public, isPublic)}>
      <div className="top-[0.025rem] flex items-start">
        <span className="relative top-0.5">
          <Icon fontSize={15} icon={IconEnum.map} />
        </span>
        <span className="text-sm underline">{title || label}</span>
      </div>
    </Link>
  ) : (
    <span className="font-lato">{label}</span>
  );
}
