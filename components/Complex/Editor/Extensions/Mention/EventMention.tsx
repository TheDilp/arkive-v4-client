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
};
export function EventMention({ id, project_id, title, label, parent_id }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isPaused, isFetched, refetch } = useGetSubEntity<EventType>(
    id,
    "events",
    {
      fields: ["id", "title", "parent_id", "is_public"],
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
      <Link
        className="font-lato mt-0 box-border inline-block h-full items-center border-none text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
        to={getMentionLink(id as string, "calendars", project_id as string, !!data?.data?.is_public, parent_id as string)}>
        <div className="top-[0.025rem] flex items-start" ref={mentionRef}>
          <span className="relative top-0.5">
            <Icon fontSize={14} icon={IconEnum.event} />
          </span>
          <span className="text-base leading-4 underline hover:text-sky-400">{data?.data?.title || title || label}</span>
        </div>
      </Link>
    );
  }
}

