import { SetStateAction, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useUpdateManyNodesLockState } from "../../hooks";
import { CurveStyleType } from "../../types";
import { BoardReferenceAtom, BoardStateAtom, dialogAtom, drawerAtom, IconEnum } from "../../utils";
import { changeLockState, curveStyles, getCurveStyleIcon } from "../../utils/ui/graphUtils";
import { Button, Tooltip } from "..";
import { ColorPicker } from "../Overlay/ColorPicker";
import { Icon } from ".";

function changeDrawMode(
  drawMode: boolean,
  setBoardState: (
    args: SetStateAction<{
      add_nodes: boolean;
      grid: boolean;
      draw_mode: boolean;
      curve_style: "straight" | "taxi" | "unbundled-bezier";
    }>,
  ) => void,
) {
  setBoardState((prev) => ({ ...prev, drawMode }));
}

function changeCurveStyle(
  curveStyle: CurveStyleType,
  setBoardState: (
    args: SetStateAction<{
      add_nodes: boolean;
      grid: boolean;
      draw_mode: boolean;
      curve_style: "straight" | "taxi" | "unbundled-bezier";
    }>,
  ) => void,
) {
  setBoardState((prev) => ({ ...prev, curveStyle }));
}

export function Quickbar({ isViewOnly }: { isViewOnly: boolean }) {
  const { item_id } = useParams();

  const [pickerColor, setPickerColor] = useState("#595959");

  const boardRef = useAtomValue(BoardReferenceAtom);
  const [boardState, setBoardState] = useAtom(BoardStateAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setDrawer = useSetAtom(drawerAtom);

  const setExportDialog = useSetAtom(dialogAtom);

  const { mutate: updateLockState } = useUpdateManyNodesLockState(item_id as string);

  return (
    <div className="absolute bottom-40 z-10 flex h-12 w-72 items-center justify-evenly rounded bg-zinc-800 px-2 text-white shadow-md lg:bottom-24">
      <Button
        hasNoBackground
        icon={IconEnum.add}
        onClick={() => {
          if (!isViewOnly) setBoardState({ ...boardState, draw_mode: false, add_nodes: !boardState.add_nodes });
        }}
      />

      {/* Toggle grid visibility */}

      <Button hasNoBackground icon={IconEnum.grid} onClick={() => setBoardState({ ...boardState, grid: !boardState.grid })} />
      {/* Lock selected elements button */}
      <Button
        hasNoBackground
        icon={IconEnum.lock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, true, updateLockState);
        }}
      />
      <Button
        hasNoBackground
        icon={IconEnum.unlock}
        onClick={() => {
          if (boardRef && !isViewOnly) changeLockState(boardRef, false, updateLockState);
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
            const edges = selected.edges();
            if (nodes.length) deleteManyNodesMutation.mutate(nodes.map((node) => node.id()));
            if (edges.length) deleteManyEdgesMutation.mutate(edges.map((edge) => edge.id()));
          }
        }}
      />

      {/* Drawmode button */}

      <Tooltip
        content={
          <div className="flex items-center gap-x-1 rounded bg-zinc-700 p-2">
            {curveStyles.map((curveStyle: CurveStyleType) => (
              <Icon
                key={curveStyle}
                className={`cursor-pointer hover:text-sky-400 ${
                  curveStyle === boardState.curve_style && boardState.draw_mode ? "text-sky-400" : ""
                }`}
                fontSize={24}
                icon={getCurveStyleIcon(curveStyle)}
                onClick={() => {
                  changeCurveStyle(curveStyle, setBoardState);
                  changeDrawMode(true, setBoardState);
                }}
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
          />
        </span>
      </Tooltip>
      {/* Export button */}
      <Button
        hasNoBackground
        icon={IconEnum.download}
        onClick={() => {
          //   setExportDialog((prev) => ({
          //     ...prev,
          //     data: { title: board.title },
          //     position: "center",
          //     modal: true,
          //     type: "export_board",
          //     show: true,
          //   }));
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
            setPickerColor(value);
            // debouncedColorPick(value);
          }}
          value={pickerColor}
        />
      </div>
    </div>
  );
}
