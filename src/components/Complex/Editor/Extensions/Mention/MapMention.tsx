import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { MapView } from "../../../../../pages/Entities";
import { MapType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";
import { Card } from "../../../../Layout";
import { Tooltip } from "../../../../Overlay";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  isPublic?: boolean;
};

function MapMentionTooltip({ id, project_id, isPublic }: Pick<Props, "id" | "project_id"> & { isPublic: boolean }) {
  const { data } = useGetEntity<MapType>(
    id as string,
    "maps",
    { data: { project_id }, fields: ["title", "image_id", "is_public"], relations: { map_pins: true } },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false, isPublic },
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <MapView data={data?.data} isPublic={isPublic} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

export function MapMention({ title, id, label, project_id, isPublic }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isPaused, isFetched, refetch } = useGetEntity<MapType>(
    id as string,
    "maps",
    {
      fields: ["is_public"],
    },
    { enabled: false, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
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
      },
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
    if (!data?.data?.is_public && isPublic) return <span>{label}</span>;
    if (!data?.data && !isPaused && isFetched)
      return (
        <span ref={mentionRef} className="font-lato underline">
          {label}
        </span>
      );
    if (!data)
      return (
        <span ref={mentionRef} className="font-lato underline decoration-wavy">
          {label}
        </span>
      );

    return (
      <Tooltip
        arrowColor="#3f3f46"
        content={<MapMentionTooltip id={id} isPublic={!!isPublic} project_id={project_id} />}
        delay={{ openDelay: 500, closeDelay: 200 }}
        isDisabled={(isPublic && !data?.data?.is_public) ?? false}
        isPortal={false}>
        <Link
          className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
          to={getMentionLink(id as string, "maps", project_id as string, !!data?.data?.is_public, isPublic)}>
          <div ref={mentionRef} className="flex items-start">
            <span className="relative top-0.5">
              <Icon fontSize={14} icon={IconEnum.map} />
            </span>
            <span className="text-base leading-4 underline">{title || label}</span>
          </div>
        </Link>
      </Tooltip>
    );
  }
}
