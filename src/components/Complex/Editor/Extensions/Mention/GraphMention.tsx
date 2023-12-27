import { Icon } from "@iconify/react";
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

function GraphMentionTooltip({ id, project_id }: Pick<Props, "id" | "project_id">) {
  const { data } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["title"], relations: { nodes: true, edges: true } },
    { enabled: !!id, queryKeyConcat: ["mention", "tooltip"], staleTime: 5 * 60 * 1000, retry: false },
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
  const { data } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["is_public"] },
    { enabled: !!id, queryKeyConcat: ["mention"], retry: false, isPublic },
  );

  return data?.data && (data?.data?.is_public || !isPublic) ? (
    <Tooltip arrowColor="#3f3f46" content={<GraphMentionTooltip id={id} project_id={project_id} />} delay={{ closeDelay: 500 }}>
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
    <span className="font-lato">{label}</span>
  );
}
