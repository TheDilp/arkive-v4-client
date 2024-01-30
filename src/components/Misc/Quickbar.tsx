import { SetStateAction, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useDeleteMany, useUpdateManySubEntities } from "../../hooks";
import { CurveStyleType } from "../../types";
import {
  BoardReferenceAtom,
  BoardStateAtom,
  dialogAtom,
  drawerAtom,
  edgesAtom,
  IconEnum,
  nodesAtom,
  useNotifications,
} from "../../utils";
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
  setBoardState((prev) => ({ ...prev, draw_mode, add_nodes: false }));
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

export function Quickbar({ isViewOnly, graphTitle }: { isViewOnly: boolean; graphTitle: string }) {
  const { item_id } = useParams();
  const createNotification = useNotifications();

  const [pickerColor, setPickerColor] = useState("#595959");

  const boardRef = useAtomValue(BoardReferenceAtom);
  const [boardState, setBoardState] = useAtom(BoardStateAtom);
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);

  const setDialog = useSetAtom(dialogAtom);
  const setDrawer = useSetAtom(drawerAtom);

  const { mutate: updateManyNodes } = useUpdateManySubEntities("nodes", item_id as string);
  const { mutate: updateManyEdges } = useUpdateManySubEntities("edges", item_id as string);
  const { mutate: deleteManyNodes } = useDeleteMany("nodes");
  const { mutate: deleteManyEdges } = useDeleteMany("edges");

  return (
    <div className="absolute bottom-0 z-10 flex h-12 w-72 items-center justify-evenly rounded bg-zinc-800 px-2 text-white shadow-md ">
      <Button
        hasNoBackground
        icon={IconEnum.add}
        onClick={() => {
          if (!isViewOnly) setBoardState({ ...boardState, draw_mode: false, add_nodes: !boardState.add_nodes });
        }}
        tooltip="Create nodes"
        variant={boardState.add_nodes ? "info" : "primary"}
      />

      <Button
        hasNoBackground
        icon={IconEnum.grid}
        onClick={() => setBoardState({ ...boardState, grid: !boardState.grid })}
        tooltip="Toggle grid"
        variant={boardState.grid ? "info" : "primary"}
      />
      <Button
        hasNoBackground
        icon={IconEnum.lock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, true, updateManyNodes, item_id as string);
        }}
        tooltip="Lock selected"
      />
      <Button
        hasNoBackground
        icon={IconEnum.unlock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, false, updateManyNodes, item_id as string);
        }}
        tooltip="Unlock selected"
      />
      <Button
        hasNoBackground
        icon={IconEnum.trash}
        onClick={() => {
          if (!boardRef || isViewOnly) return;
          const selected = boardRef.elements(":selected");
          if (selected.length === 0) {
            createNotification({ timer: 3, title: "No elements are selected.", variant: "info", icon: IconEnum.info_circle });
          } else {
            const nodes = selected.nodes();
            const node_ids = nodes.map((n) => n.id());
            const edges = selected.edges();
            const edge_ids = edges.map((e) => e.id());

            if (nodes.length)
              deleteManyNodes(
                {
                  data: { ids: node_ids },
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
                  data: { ids: edge_ids },
                },
                {
                  onSuccess: () => {
                    setEdges((prev) => prev.filter((e) => !edge_ids.includes(e.id)));
                  },
                },
              );
          }
        }}
        tooltip="Delete selected"
      />

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
            data: {
              title: graphTitle,
            },
          }));
        }}
        tooltip="Export graph"
      />

      <Button
        hasNoBackground
        icon={IconEnum.character}
        isIconOnly
        onClick={() =>
          setDrawer((prev) => ({
            ...prev,
            title: "Nodes from characters",
            type: "nodes_from_characters",
            data: null,
            size: "lg",
          }))
        }
        tooltip="Create node from characters"
      />
      {/* <Button hasNoBackground icon={IconEnum.image} isIconOnly tooltip="Create node from images" /> */}

      <div className="">
        <ColorPicker
          name="pickerColor"
          onChange={({ value }) => {
            if (boardRef) {
              const selected = boardRef.elements(":selected");

              const nodes = selected.nodes();
              const edges = selected.edges();

              if (nodes?.length) {
                const nodeUpdateData = {
                  data: nodes.map((n) => ({ data: { id: n.id(), parent_id: item_id as string, background_color: value } })),
                };
                updateManyNodes(nodeUpdateData, {});
              }
              if (edges?.length) {
                const edgeUpdateData = {
                  data: edges.map((n) => ({ data: { id: n.id(), parent_id: item_id as string, line_color: value } })),
                };
                updateManyEdges(edgeUpdateData);
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
