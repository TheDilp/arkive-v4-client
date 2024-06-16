import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
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
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isFetched, isPaused, refetch } = useGetSubEntity<BlueprintInstanceType>(
    id as string,
    "blueprint_instances",
    {
      data: {
        id,
      },
      fields: ["id", "title", "is_public", "parent_id"],
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
    if (!data?.data?.is_public && isPublic) return <span ref={mentionRef}>{label}</span>;
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
        className="inline-flex items-center font-lato font-bold underline transition-colors hover:text-sky-400"
        to={getMentionLink(
          id as string,
          "blueprint_instances",
          project_id as string,
          data?.data?.is_public ?? false,
          isPublic,
          parent_id || data?.data?.parent_id,
        )}>
        <div className="flex items-start" ref={mentionRef}>
          {icon ? (
            <span className="relative top-[2px]">
              <Icon fontSize={14} icon={icon ?? IconEnum.blueprint} />
            </span>
          ) : null}
          <span className="text-base leading-4 underline">{title || label}</span>
        </div>
      </Link>
    );
  }
}
