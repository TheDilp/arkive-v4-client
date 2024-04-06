import { Icon } from "@iconify/react";
import { MutableRefObject, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { GraphType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";
import { Card, Graph, Tooltip } from "../../../..";

type Props = {
  id: string | undefined;
  label: string;
  title?: string;
  project_id: string | undefined;
  isPublic?: boolean;
};

function GraphMentionTooltip({ id, project_id, isPublic }: Pick<Props, "id" | "project_id" | "isPublic">) {
  const { data } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["title", "is_public"], relations: { nodes: true, edges: true } },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false, isPublic },
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <Graph data={data?.data} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

export function GraphMention({ title, id, label, project_id, isPublic }: Props) {
  const mentionRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { data, refetch } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["is_public"] },
    { enabled: false, queryKeyConcat: ["mention"], retry: false, isPublic },
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

  return data?.data && (data?.data?.is_public || !isPublic) ? (
    <Tooltip
      arrowColor="#3f3f46"
      content={<GraphMentionTooltip id={id} isPublic={!!isPublic} project_id={project_id} />}
      delay={{ closeDelay: 500 }}
      isPortal={false}>
      <Link
        className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
        id={`link-${id}`}
        to={getMentionLink(id as string, "graphs", project_id as string, !!data?.data?.is_public, isPublic)}>
        <div className="top-[0.025rem] flex items-start">
          <span className="relative top-0.5">
            <Icon fontSize={15} icon={IconEnum.graph} />
          </span>
          <span className="text-sm underline">{title || label}</span>
        </div>
      </Link>
    </Tooltip>
  ) : (
    <span className="font-lato underline decoration-wavy">{label}</span>
  );
}
