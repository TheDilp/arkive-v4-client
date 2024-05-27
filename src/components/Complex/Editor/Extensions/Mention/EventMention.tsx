import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useGetSubEntity } from "../../../../../hooks";
import { EventType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  parent_id?: string;
  isPublic?: boolean;
};
export function EventMention({ id, project_id, title, label, isPublic, parent_id }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isPaused, isFetched, refetch } = useGetSubEntity<EventType>(
    id,
    "events",
    {
      fields: ["id", "title", "parent_id", "is_public"],
    },
    { enabled: false, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
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
    if (!data?.data?.is_public && isPublic) return <span ref={mentionRef}>{label}</span>;
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
      <Link
        className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
        to={getMentionLink(
          id as string,
          "calendars",
          project_id as string,
          !!data?.data?.is_public,
          isPublic,
          parent_id as string,
        )}>
        <div ref={mentionRef} className="top-[0.025rem] flex items-start">
          <span className="relative top-0.5">
            <Icon fontSize={14} icon={IconEnum.event} />
          </span>
          <span className="text-base leading-4 underline hover:text-sky-400">{data?.data?.title || title || label}</span>
        </div>
      </Link>
    );
  }
}
