import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { CharacterType } from "../../../../../types";
import { getImageURL, getMentionLink, IconEnum } from "../../../../../utils";
import { Card } from "../../../../Layout";
import { Avatar, Spinner } from "../../../../Misc";
import { Tooltip } from "../../../../Overlay";
import { StaticRender } from "../../StaticRender";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
};

function CharacterMentionTooltip({ title, id }: Pick<Props, "id" | "title">) {
  const { project_id } = useParams();
  const { data, isLoading } = useGetEntity<CharacterType>(
    id as string,
    "characters",
    { data: { id }, fields: ["biography", "is_public", "portrait_id"] },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"] }
  );
  return (
    <Card avatar={getImageURL(project_id as string, "images", data?.data.portrait_id)} title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto overflow-x-hidden whitespace-pre-line">
        {data?.data?.biography && !isLoading ? <StaticRender content={data.data.biography as RemirrorJSON} /> : null}
        {isLoading ? (
          <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
            <Spinner />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function CharacterMention({ id, project_id, title, label }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isPaused, isFetched, refetch } = useGetEntity<CharacterType>(
    id,
    "characters",
    {
      fields: ["id", "full_name", "is_public", "portrait_id"],
    },
    { enabled: false, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"], retry: false }
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
        <span className="font-lato underline" ref={mentionRef}>
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
      <Tooltip
        arrowColor="#3f3f46"
        content={<CharacterMentionTooltip id={id} title={data?.data?.full_name || title || label} />}
        delay={{ openDelay: 500, closeDelay: 200 }}
        isDisabled={((IS_PUBLIC && !data?.data?.is_public) || IS_GATEWAY) ?? false}
        isPortal={false}>
        <Link
          className="inline-flex items-center font-lato text-sm font-bold transition-colors"
          to={getMentionLink(id as string, "characters", project_id as string, data?.data?.is_public ?? false)}>
          <div className="flex items-start" ref={mentionRef}>
            {data?.data?.portrait_id && project_id ? (
              <span className="characterMentionImage" onClick={(e) => e.preventDefault()}>
                <Avatar hasShowImage image={getImageURL(project_id as string, "images", data?.data?.portrait_id)} size="2xs" />
              </span>
            ) : (
              <Icon fontSize={14} icon={IconEnum.character} />
            )}
            <span className="text-base leading-4 underline hover:text-sky-400">{data?.data?.full_name || title || label}</span>
          </div>
        </Link>
      </Tooltip>
    );
  }
}
