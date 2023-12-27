/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetSubEntity } from "../../../../../hooks";
import { MapPinType } from "../../../../../types";
import { getImageURL, getMentionLink, IconEnum } from "../../../../../utils";
import { Avatar } from "../../../../Misc";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  parent_id: string | undefined;
  isPublic?: boolean;
};
export function MapPinMention({ title, id, label, project_id, isPublic, parent_id }: Props) {
  const { data } = useGetSubEntity<MapPinType>(
    id as string,
    "map_pins",
    {
      fields: ["title", "icon", "image_id", "is_public"],
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );

  return id ? (
    <Link
      className="inline-flex items-center font-lato text-sm font-bold transition-colors"
      to={getMentionLink(id as string, "map_pins", project_id as string, data?.data?.is_public ?? false, isPublic, parent_id)}>
      <div className="flex items-start">
        {data?.data?.image_id ? (
          <span className="characterMentionImage" onClick={(e) => e.preventDefault()}>
            <Avatar hasShowImage image={getImageURL(project_id as string, "images", data?.data?.image_id)} size="3xs" />
          </span>
        ) : (
          <Icon fontSize={15} icon={IconEnum.map_pin} />
        )}
        <span className="underline hover:text-sky-400">{data?.data?.title || title || label || ""}</span>
      </div>
    </Link>
  ) : (
    <span className="font-lato text-sm">{label || ""}</span>
  );
}
