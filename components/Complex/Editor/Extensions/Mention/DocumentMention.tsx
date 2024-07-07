import { MutableRefObject, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { DocumentType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";
import { Card, Icon, Spinner, Tooltip } from "../../../..";
import { StaticRender } from "../..";

type Props = {
  alterId: string | null;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  title?: string;
};

function DocumentMentionTooltip({ title, id }: Pick<Props, "id" | "title">) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { data: { id }, fields: ["content", "is_public"] },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"] }
  );
  return (
    <Card title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto overflow-x-hidden whitespace-pre-line">
        {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
        {isLoading ? (
          <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
            <Spinner />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
export function DocumentMention({ alterId, title, id, label, project_id }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, isFetched, isPaused, refetch } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    {
      fields: ["id", "title", "is_public"],
      relations: {
        alter_names: !!alterId,
      },
    },
    { enabled: false, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false }
  );
  const alter_name = data?.data?.alter_names?.find((an) => an.id === alterId);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if ((!!id || !!alterId) && !data && entry.isIntersecting) refetch();
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
  if (id || alterId) {
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
      <Tooltip
        arrowColor="#3f3f46"
        content={<DocumentMentionTooltip id={id} title={data?.data?.title || title || label} />}
        delay={{ openDelay: 500, closeDelay: 200 }}
        isDisabled={(IS_PUBLIC && !data?.data?.is_public) ?? false}
        isPortal={false}>
        <Link
          className="font-lato mt-0 box-border inline-block h-full items-center border-none text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
          to={getMentionLink(id as string, "documents", project_id as string, data?.data?.is_public ?? false)}>
          <div className="flex items-start" ref={mentionRef}>
            <span className="relative top-0.5">
              <Icon fontSize={14} icon={IconEnum.document} />
            </span>
            <span className="text-base leading-4 underline">{alter_name?.title || data?.data?.title || title || label}</span>
          </div>
        </Link>
      </Tooltip>
    );
  }
}

