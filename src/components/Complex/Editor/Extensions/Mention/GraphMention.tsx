import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { GraphType } from "../../../../../types";
import { IconEnum } from "../../../../../utils";
import { Card, Graph, Tooltip } from "../../../..";

type Props = {
  nodeId: string | undefined;
  nodeLabel: string;
  title?: string;
  project_id: string | undefined;
};

function GraphMentionTooltip({ nodeId, project_id }: Pick<Props, "nodeId" | "project_id">) {
  const { data } = useGetEntity<GraphType>(
    nodeId as string,
    "graphs",
    { data: { project_id }, fields: ["title"], relations: { nodes: true, edges: true } },
    { enabled: !!nodeId, queryKeyConcat: ["mention"] },
  );
  return (
    <Card title={data?.data?.title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data ? <Graph data={data?.data} isReadOnly isViewOnly /> : null}
      </div>
    </Card>
  );
}

export function GraphMention({ title, nodeId, nodeLabel, project_id }: Props) {
  return nodeId ? (
    <Tooltip
      arrowColor="#3f3f46"
      content={<GraphMentionTooltip nodeId={nodeId} project_id={project_id} />}
      delay={{ closeDelay: 500 }}>
      <Link
        className="inline-flex font-lato font-bold underline transition-colors hover:text-sky-400"
        id={`link-${nodeId}`}
        to={!project_id ? `/view/graphs/${nodeId}` : `/projects/${project_id}/graphs/${nodeId}`}>
        <div className="relative -top-[0.0625rem] flex items-start">
          <span className="relative">
            <Icon fontSize={14} icon={IconEnum.graph} />
          </span>
          <span className="text-sm underline">{title || nodeLabel}</span>
        </div>
      </Link>
    </Tooltip>
  ) : (
    <div className="font-lato text-sm">
      <Icon icon={IconEnum.edit} />
      {nodeLabel}
    </div>
  );
}
