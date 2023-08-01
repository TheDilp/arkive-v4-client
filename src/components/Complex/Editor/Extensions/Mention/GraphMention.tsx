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
        className="font-Lato inline-flex text-sm font-bold text-white underline transition-colors hover:text-sky-400"
        id={`link-${nodeId}`}
        to={!project_id ? `/view/boards/${nodeId}` : `/project/${project_id}/boards/${nodeId}`}>
        <Icon fontSize={15} icon={IconEnum.edit} />
        {title || nodeLabel}
      </Link>
    </Tooltip>
  ) : (
    <div className="Lato text-white">
      <Icon icon={IconEnum.edit} />
      {nodeLabel}
    </div>
  );
}
