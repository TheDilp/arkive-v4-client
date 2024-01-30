import { MutableRefObject, useRef } from "react";

import { useUpdateManySubEntities } from "..";

type NodePositionUpdateType = { id: string; x: number; y: number };
function useBatchUpdateNodePositions(parent_id: string) {
  const batchedData = useRef() as MutableRefObject<NodePositionUpdateType[]>;
  const timer = useRef([]) as MutableRefObject<any>;
  const updateManyNodePositions = useUpdateManySubEntities("nodes", parent_id);

  function addOrUpdateNode(newNode: NodePositionUpdateType) {
    batchedData.current = [...(batchedData.current || [])];
    const idx = batchedData.current.findIndex((n: NodePositionUpdateType) => n.id === newNode.id);

    if (idx > -1) {
      batchedData.current[idx].x = newNode.x;
      batchedData.current[idx].y = newNode.y;
    } else {
      batchedData.current.push(newNode);
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateManyNodePositions.mutate({ data: batchedData.current.map((node) => ({ data: node })) });
      batchedData.current = [];
    }, 350);
  }

  return { addOrUpdateNode, isMutating: updateManyNodePositions.isLoading };
}

export { useBatchUpdateNodePositions };
