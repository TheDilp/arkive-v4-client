import { MutableRefObject, ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { isRemirrorJSON, RemirrorJSON } from "remirror";

import { useGetEntity, useGetSubEntity } from "../../../../../hooks";
import { MapView } from "../../../../../pages";
import { CharacterType, DocumentType, GraphType, MapType, SearchableMentionEntities, WordType } from "../../../../../types";
import { AvailableIcons, getDefaultEntityIcon, getEntityFields, getMentionLink } from "../../../../../utils";
import { Graph } from "../../../../DataDisplay";
import { Card } from "../../../../Layout";
import { Avatar, Icon, Spinner } from "../../../../Misc";
import { Tooltip } from "../../../../Overlay";
import { StaticRender } from "../../StaticRender";

type Props = {
  alter_name: string | null;
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined | null;
  icon?: string | null;
  parent_id: string | null | undefined;
  type: SearchableMentionEntities;
};

function MentionTooltipCard({
  image_id,
  title,
  children,
}: {
  image_id?: string | undefined | null;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card avatar={image_id} title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">{children}</div>
    </Card>
  );
}

function CharacterMentionTooltip({ alter_name, title, id }: Pick<Props, "id" | "title" | "alter_name">) {
  const { data, isLoading } = useGetEntity<CharacterType>(
    id as string,
    "characters",
    { data: { id }, fields: ["biography", "is_public", "portrait_id"] },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"] }
  );
  return (
    <MentionTooltipCard image_id={data?.data.portrait_id} title={alter_name || title || ""}>
      {data?.data?.biography && isRemirrorJSON(data?.data?.biography) && !isLoading ? (
        <StaticRender content={data.data.biography as RemirrorJSON} />
      ) : null}
      {isLoading ? (
        <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
          <Spinner />
        </div>
      ) : null}
    </MentionTooltipCard>
  );
}
function DocumentMentionTooltip({ alter_name, title, id }: Pick<Props, "id" | "title" | "alter_name">) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { data: { id }, fields: ["content", "is_public"] },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"] }
  );
  return (
    <MentionTooltipCard title={alter_name || title || ""}>
      {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
      {isLoading ? (
        <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
          <Spinner />
        </div>
      ) : null}
    </MentionTooltipCard>
  );
}

function MapPinMentionTooltip({
  alter_name,
  title,
  id,
  parent_id,
  project_id,
}: Pick<Props, "id" | "alter_name" | "title" | "parent_id" | "project_id">) {
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
    <MentionTooltipCard title={alter_name || title || ""}>
      {data?.data ? <MapView center_on={id} data={data?.data} isReadOnly isViewOnly /> : null}
    </MentionTooltipCard>
  );
}

function MapMentionTooltip({ alter_name, title, id, project_id }: Pick<Props, "id" | "project_id" | "title" | "alter_name">) {
  const { data } = useGetEntity<MapType>(
    id as string,
    "maps",
    { data: { project_id }, fields: ["title", "image_id", "is_public"], relations: { map_pins: true } },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false }
  );
  return (
    <MentionTooltipCard title={alter_name || title || ""}>
      {data?.data ? <MapView data={data?.data} isReadOnly isViewOnly /> : null}
    </MentionTooltipCard>
  );
}

function GraphMentionTooltip({ id, title, alter_name, project_id }: Pick<Props, "id" | "project_id" | "alter_name" | "title">) {
  const { data } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["title", "is_public"], relations: { nodes: true, edges: true } },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false }
  );
  return (
    <MentionTooltipCard title={alter_name || title || ""}>
      {data?.data ? <Graph data={data?.data} isReadOnly /> : null}
    </MentionTooltipCard>
  );
}

function WordMentionTooltip({ id }: Pick<Props, "id">) {
  const { data: existingWord, isLoading } = useGetSubEntity<WordType>(
    id as string,
    "words",
    {
      data: {
        id,
      },
      fields: ["id", "title", "translation", "description"],
    },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], retry: false, staleTime: 5 * 60 * 1000 }
  );
  return (
    <div className="h-fit min-h-[4rem] w-fit min-w-[10rem] rounded border border-zinc-600 bg-zinc-700 p-2 shadow-lg">
      <div className="flex flex-col whitespace-pre-line font-light">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : null}
        <span className="font-merriweather text-lg italic underline">
          {existingWord?.data?.title ? `${existingWord?.data?.title}: ${existingWord?.data?.translation}` : null}
        </span>
        {existingWord?.data?.description && !isLoading ? existingWord?.data.description : null}
      </div>
    </div>
  );
}

function MentionTooltip({ alter_name, title, id, parent_id, project_id, type }: Omit<Props, "label">) {
  if (type === "characters") return <CharacterMentionTooltip alter_name={alter_name} id={id} title={title} />;
  if (type === "documents") return <DocumentMentionTooltip alter_name={alter_name} id={id} title={title} />;
  if (type === "map_pins")
    return <MapPinMentionTooltip alter_name={alter_name} id={id} parent_id={parent_id} project_id={project_id} title={title} />;
  if (type === "maps") return <MapMentionTooltip alter_name={alter_name} id={id} project_id={project_id} title={title} />;
  if (type === "graphs") return <GraphMentionTooltip alter_name={alter_name} id={id} project_id={project_id} title={title} />;
  if (type === "words") return <WordMentionTooltip id={id} />;
  return null;
}

export function Mention({ id, project_id, title, label, alter_name, icon, parent_id, type }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const isSubEntity = type === "map_pins" || type === "blueprint_instances" || type === "words" || type === "events";
  const { data, isPaused, isFetched, refetch } = useGetEntity<Record<string, string> & Record<"is_public", boolean>>(
    id,
    type,
    {
      fields: getEntityFields(type),
    },
    { enabled: false, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"], retry: false }
  );

  const {
    data: subEntityData,
    isFetched: isSubEntityFetched,
    isPaused: isSubentityPaused,
    refetch: subEntityRefetch,
  } = useGetSubEntity<Record<string, string> & Record<"is_public", boolean>>(
    id as string,
    type as "map_pins" | "blueprint_instances" | "words" | "events",
    {
      data: {
        parent_id,
      },
      fields: getEntityFields(type),
    },
    {
      enabled: false,
      staleTime: 20 * 60 * 1000,
      queryKeyConcat: ["mention"],
      retry: false,
    }
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!!id && entry.isIntersecting) {
          if (isSubEntity && !subEntityData) {
            subEntityRefetch();
          } else if (!isSubEntity && !data) {
            refetch();
          }
        }
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
    if ((isSubEntity ? !subEntityData?.data?.is_public : !data?.data?.is_public) && IS_PUBLIC)
      return <span ref={mentionRef}>{label}</span>;
    if (
      (isSubEntity ? !subEntityData?.data : !data?.data) &&
      (isSubEntity ? !isSubentityPaused : !isPaused) &&
      (isSubEntity ? isSubEntityFetched : isFetched)
    )
      return <span ref={mentionRef}>{label}</span>;
    if (!data && !subEntityData)
      return (
        <span ref={mentionRef} className="underline decoration-wavy">
          {label}
        </span>
      );
    return (
      <Tooltip
        arrowColor="#3f3f46"
        content={
          <MentionTooltip
            alter_name={alter_name}
            id={id}
            parent_id={parent_id}
            project_id={project_id}
            title={title || label}
            type={type}
          />
        }
        delay={{ openDelay: 500, closeDelay: 200 }}
        isDisabled={
          ((IS_PUBLIC && (isSubEntity ? !subEntityData?.data?.is_public : !data?.data?.is_public)) ||
            type === "events" ||
            type === "blueprint_instances" ||
            IS_GATEWAY) ??
          false
        }
        isPortal={false}>
        {type === "words" ? (
          <span ref={mentionRef} className="cursor-pointer text-base font-light italic leading-4">
            {data?.data?.title || title || label}
            <sup>*</sup>
          </span>
        ) : (
          <Link
            className="inline-flex items-center text-sm font-bold transition-colors"
            to={getMentionLink(
              id as string,
              type,
              project_id as string,
              (isSubEntity ? data?.data?.is_public : data?.data?.is_public) ?? false,
              parent_id
            )}>
            <div ref={mentionRef} className="flex items-start">
              {data?.data?.portrait_id && project_id ? (
                <span className="characterMentionImage" onClick={(e) => e.preventDefault()}>
                  <Avatar hasShowImage image_id={data?.data?.portrait_id} size="3xs" />
                </span>
              ) : (
                <Icon
                  fontSize={14}
                  icon={(data?.data?.icon || subEntityData?.data?.icon || icon || getDefaultEntityIcon(type)) as AvailableIcons}
                />
              )}
              <span className="text-base leading-4 underline hover:text-sky-400">
                {alter_name || data?.data?.full_name || title || label}
              </span>
            </div>
          </Link>
        )}
      </Tooltip>
    );
  }
}
