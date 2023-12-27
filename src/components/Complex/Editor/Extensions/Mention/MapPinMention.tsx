/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity, useGetSubEntity } from "../../../../../hooks";
import { MapView } from "../../../../../pages/Entities";
import { MapPinType, MapType } from "../../../../../types";
import { getImageURL, getMentionLink, IconEnum } from "../../../../../utils";
import { Card } from "../../../../Layout";
import { Avatar } from "../../../../Misc";
import { Tooltip } from "../../../../Overlay";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  parent_id: string | undefined;
  isPublic?: boolean;
};

function MapPinMentionTooltip({ id, parent_id, project_id }: Pick<Props, "id" | "parent_id" | "project_id">) {
  const { data } = useGetEntity<MapType>(
    parent_id as string,
    "maps",
    { data: { project_id }, fields: ["title", "image_id"], relations: { map_pins: true } },
    { enabled: !!parent_id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false },
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <MapView center_on={id} data={data?.data} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

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
    <Tooltip content={<MapPinMentionTooltip id={id} parent_id={parent_id} project_id={project_id} />}>
      <Link
        className="inline-flex items-center font-lato text-sm font-bold transition-colors"
        to={getMentionLink(
          id as string,
          "map_pins",
          project_id as string,
          data?.data?.is_public ?? false,
          isPublic,
          parent_id,
        )}>
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
    </Tooltip>
  ) : (
    <span className="font-lato">{label || ""}</span>
  );
}
