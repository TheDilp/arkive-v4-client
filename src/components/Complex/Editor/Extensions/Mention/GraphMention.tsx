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
export function GraphMention({ title, nodeId, nodeLabel, project_id }: Props) {
  const { data, isLoading } = useGetEntity<GraphType>(
    nodeId,
    "graphs",
    { data: {} },
    { enabled: !!nodeId, staleTime: 5 * 60 * 1000 },
  );

  return nodeId ? (
    <Tooltip
      content={
        <Card title={data?.data?.title || ""}>{data?.data ? <Graph data={data?.data} isReadOnly isViewOnly /> : null}</Card>
      }
      isDisabled={isLoading || !!data?.data}>
      <Link
        className="inline-flex font-lato font-bold text-white underline transition-colors hover:text-sky-400"
        id={`link-${nodeId}`}
        to={!project_id ? `/view/boards/${nodeId}` : `/projects/${project_id}/boards/${nodeId}`}>
        <div className="flex items-start">
          <span className="relative top-0.5">
            <Icon fontSize={16} icon={IconEnum.board} />
          </span>
          <span className="underline">{title || nodeLabel}</span>
        </div>
      </Link>
    </Tooltip>
  ) : (
    <div className="Lato text-white">
      <Icon icon={IconEnum.edit} />
      {nodeLabel}
    </div>
  );
}
