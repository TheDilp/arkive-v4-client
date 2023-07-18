import { MutableRefObject, useRef } from "react";

import { useUpdateManyNodesPosition } from "..";

type NodePositionUpdateType = { id: string; x: number; y: number };
const useBatchUpdateNodePositions = (item_id: string) => {
  const batchedData = useRef() as MutableRefObject<NodePositionUpdateType[]>;
  const timer = useRef([]) as MutableRefObject<any>;
  const updateManyNodePositions = useUpdateManyNodesPosition(item_id);

  const addOrUpdateNode = (newNode: NodePositionUpdateType) => {
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
      updateManyNodePositions.mutate(batchedData.current);
      batchedData.current = [];
    }, 800);
  };

  return { addOrUpdateNode };
};

export { useBatchUpdateNodePositions };
