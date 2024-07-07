import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useGetEntity, useGetSubEntity } from "../../../../../hooks";
import { MapView } from "../../../../../pages/Entities/MapView";
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
};

function MapPinMentionTooltip({ id, parent_id, project_id }: Pick<Props, "id" | "parent_id" | "project_id">) {
  const { data } = useGetEntity<MapType>(
    parent_id as string,
    "maps",
    {
      data: { project_id },
      fields: ["title", "image_id", "cluster_pins", "owner_id"],
      permissions: true,
      relations: { map_pins: true },
    },
    { enabled: !!parent_id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false }
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <MapView center_on={id} data={data?.data} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

export function MapPinMention({ title, id, label, project_id, parent_id }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isFetched, isPaused, refetch } = useGetSubEntity<MapPinType>(
    id as string,
    "map_pins",
    {
      fields: ["title", "icon", "image_id", "is_public"],
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!!id && !data && entry.isIntersecting) refetch();
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1, // 100% of target visible
      }
    );

    if (mentionRef.current) {
      observer.observe(mentionRef.current);
    }

    return () => {
      if (mentionRef.current) {
        observer.unobserve(mentionRef.current);
      }
    };
  }, []);

  if (id) {
    if (!data?.data?.is_public && IS_PUBLIC) return <span ref={mentionRef}>{label}</span>;
    if (!data?.data && !isPaused && isFetched)
      return (
        <span className="font-lato underline decoration-wavy" ref={mentionRef}>
          {label}
        </span>
      );
    if (!data)
      return (
        <span className="font-lato underline decoration-wavy" ref={mentionRef}>
          {label}
        </span>
      );

    return (
      <Tooltip arrowColor="#3f3f46" content={<MapPinMentionTooltip id={id} parent_id={parent_id} project_id={project_id} />}>
        <Link
          className="font-lato inline-flex items-center text-sm font-bold transition-colors"
          to={getMentionLink(id as string, "map_pins", project_id as string, data?.data?.is_public ?? false, parent_id)}>
          <div className="flex items-start" ref={mentionRef}>
            {data?.data?.image_id ? (
              <span className="characterMentionImage" onClick={(e) => e.preventDefault()}>
                <Avatar hasShowImage image={getImageURL(project_id as string, "images", data?.data?.image_id)} size="3xs" />
              </span>
            ) : (
              <Icon fontSize={14} icon={IconEnum.map_pin} />
            )}
            <span className="text-base leading-4 underline hover:text-sky-400">
              {data?.data?.title || title || label || ""}
            </span>
          </div>
        </Link>
      </Tooltip>
    );
  }
}

