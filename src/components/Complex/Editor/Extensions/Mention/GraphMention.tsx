import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { GraphType } from "../../../../../types";
import { IconEnum } from "../../../../../utils";
import { Card, Graph, Tooltip } from "../../../..";

type Props = {
  id: string | undefined;
  label: string;
  title?: string;
  project_id: string | undefined;
};

function GraphMentionTooltip({ id, project_id }: Pick<Props, "id" | "project_id">) {
  const { data } = useGetEntity<GraphType>(
    id as string,
    "graphs",
    { data: { project_id }, fields: ["title"], relations: { nodes: true, edges: true } },
    { enabled: !!id, queryKeyConcat: ["mention"] },
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <Graph data={data?.data} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

export function GraphMention({ title, id, label, project_id }: Props) {
  return id ? (
    <Tooltip arrowColor="#3f3f46" content={<GraphMentionTooltip id={id} project_id={project_id} />} delay={{ closeDelay: 500 }}>
      <Link
        className="inline-flex font-lato font-bold underline transition-colors hover:text-sky-400"
        id={`link-${id}`}
        to={!project_id ? `/public/graphs/${id}` : `/projects/${project_id}/graphs/${id}`}>
        <div className="relative -top-[0.0625rem] flex items-start">
          <span className="relative">
            <Icon fontSize={14} icon={IconEnum.graph} />
          </span>
          <span className="text-sm underline">{title || label}</span>
        </div>
      </Link>
    </Tooltip>
  ) : (
    <div className="font-lato text-sm">
      <Icon icon={IconEnum.edit} />
      {label}
    </div>
  );
}
