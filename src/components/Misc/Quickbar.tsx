import { SetStateAction, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

import { useDeleteMany, useUpdateManySubEntities } from "../../hooks";
import { CurveStyleType } from "../../types";
import { BoardReferenceAtom, BoardStateAtom, dialogAtom, drawerAtom, edgesAtom, IconEnum, nodesAtom } from "../../utils";
import { changeLockState, curveStyles, getCurveStyleIcon } from "../../utils/ui/graphUtils";
import { Button, Tooltip } from "..";
import { ColorPicker } from "../Overlay/ColorPicker";

function changeDrawMode(
  draw_mode: boolean,
  setBoardState: (
    args: SetStateAction<{
      add_nodes: boolean;
      grid: boolean;
      draw_mode: boolean;
      curve_style: "straight" | "taxi" | "unbundled-bezier";
    }>,
  ) => void,
) {
  setBoardState((prev) => ({ ...prev, draw_mode }));
}

function changeCurveStyle(
  curve_style: CurveStyleType,
  setBoardState: (
    args: SetStateAction<{
      add_nodes: boolean;
      grid: boolean;
      draw_mode: boolean;
      curve_style: "straight" | "taxi" | "unbundled-bezier";
    }>,
  ) => void,
) {
  setBoardState((prev) => ({ ...prev, curve_style }));
}

export function Quickbar({ isViewOnly }: { isViewOnly: boolean }) {
  const [pickerColor, setPickerColor] = useState("#595959");

  const boardRef = useAtomValue(BoardReferenceAtom);
  const [boardState, setBoardState] = useAtom(BoardStateAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);

  const setDialog = useSetAtom(dialogAtom);

  const { mutate: updateManyNodes } = useUpdateManySubEntities("nodes");
  const { mutate: updateManyEdges } = useUpdateManySubEntities("edges");
  const { mutate: deleteManyNodes } = useDeleteMany("nodes");
  const { mutate: deleteManyEdges } = useDeleteMany("edges");

  return (
    <div className="absolute bottom-40 z-10 flex h-12 w-72 items-center justify-evenly rounded bg-zinc-800 px-2 text-white shadow-md lg:bottom-24">
      <Button
        hasNoBackground
        icon={IconEnum.add}
        onClick={() => {
          if (!isViewOnly) setBoardState({ ...boardState, draw_mode: false, add_nodes: !boardState.add_nodes });
        }}
        tooltip="Create nodes"
        variant={boardState.add_nodes ? "info" : "primary"}
      />

      {/* Toggle grid visibility */}

      <Button
        hasNoBackground
        icon={IconEnum.grid}
        onClick={() => setBoardState({ ...boardState, grid: !boardState.grid })}
        variant={boardState.grid ? "info" : "primary"}
      />
      {/* Lock selected elements button */}
      <Button
        hasNoBackground
        icon={IconEnum.lock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, true, updateManyNodes);
        }}
      />
      <Button
        hasNoBackground
        icon={IconEnum.unlock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, false, updateManyNodes);
        }}
      />
      <Button
        hasNoBackground
        icon={IconEnum.trash}
        onClick={() => {
          if (!boardRef || isViewOnly) return;
          const selected = boardRef.elements(":selected");
          if (selected.length === 0) {
            // toaster("warning", "No elements are selected.");
          } else {
            const nodes = selected.nodes();
            const node_ids = nodes.map((n) => n.id());
            const edges = selected.edges();
            const edge_ids = edges.map((e) => e.id());

            if (nodes.length)
              deleteManyNodes(
                {
                  data: nodes.map((node) => ({
                    id: node.id(),
                  })),
                },
                {
                  onSuccess: () => {
                    setEdges((prev) => prev.filter((e) => !node_ids.includes(e.source_id) && !node_ids.includes(e.target_id)));
                    setNodes((prev) => prev.filter((n) => !node_ids.includes(n.id)));
                  },
                },
              );
            if (edges.length)
              deleteManyEdges(
                {
                  data: edges.map((edge) => ({
                    id: edge.id(),
                  })),
                },
                {
                  onSuccess: () => {
                    setEdges((prev) => prev.filter((e) => !edge_ids.includes(e.id)));
                  },
                },
              );
          }
        }}
      />

      {/* Drawmode button */}

      <Tooltip
        content={
          <div className="flex items-center gap-x-1 rounded bg-zinc-700 p-2">
            {curveStyles.map((curveStyle: CurveStyleType) => (
              <Button
                key={curveStyle}
                hasNoBackground
                icon={getCurveStyleIcon(curveStyle)}
                onClick={() => {
                  changeCurveStyle(curveStyle, setBoardState);
                  changeDrawMode(true, setBoardState);
                }}
                variant={boardState.curve_style === curveStyle ? "info" : "primary"}
              />
            ))}
          </div>
        }
        isDisabled={isViewOnly}>
        <span className="cursor-pointer">
          <Button
            hasNoBackground
            icon={getCurveStyleIcon(boardState.curve_style)}
            onClick={() => {
              if (boardState.draw_mode) changeDrawMode(false, setBoardState);
              else {
                changeDrawMode(false, setBoardState);
                setBoardState((prev) => ({ ...prev, addNodes: false }));
              }
            }}
            variant={boardState.draw_mode ? "info" : "primary"}
          />
        </span>
      </Tooltip>
      <Button
        hasNoBackground
        icon={IconEnum.download}
        onClick={() => {
          setDialog((prev) => ({
            ...prev,
            title: "Export graph",
            position: "center",
            modal: true,
            type: "export_graph",
          }));
        }}
      />

      {/* Edit selected button */}
      <Button
        hasNoBackground
        icon={IconEnum.edit_many_nodes_edges}
        onClick={() => {
          if (!boardRef) return;
          if (boardRef.elements(":selected")?.length > 0) {
            setDrawer((prev) => ({ ...prev, position: "right", type: "many_nodes", show: true }));
          } else {
            // toaster("warning", "No elements are selected.");
          }
        }}
      />

      <div className="pl-2">
        <ColorPicker
          name="pickerColor"
          onChange={({ value }) => {
            if (boardRef) {
              const selected = boardRef.elements(":selected");

              const nodes = selected.nodes();
              const edges = selected.edges();

              if (nodes?.length) {
                const nodeUpdateData = nodes.map((n) => ({ id: n.id(), background_color: value }));
                updateManyNodes(nodeUpdateData, {
                  onSuccess: () => {
                    const node_ids = nodes.map((n) => n.id());
                    setNodes((prev) =>
                      prev.map((node) => {
                        if (node_ids.includes(node.id)) return { ...node, background_color: value };
                        return node;
                      }),
                    );
                  },
                });
              }
              if (edges?.length) {
                const edgeUpdateData = edges.map((n) => ({ id: n.id(), background_color: value }));
                updateManyEdges(edgeUpdateData, {
                  onSuccess: () => {
                    const edge_ids = edges.map((n) => n.id());
                    setEdges((prev) =>
                      prev.map((node) => {
                        if (edge_ids.includes(node.id)) return { ...node, line_color: value };
                        return node;
                      }),
                    );
                  },
                });
              }

              setPickerColor(value);
            }
          }}
          value={pickerColor}
        />
      </div>
    </div>
  );
}
