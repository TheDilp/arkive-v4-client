import { useAtomValue } from "jotai";
import { useState } from "react";

import { BoardExportType } from "../../../types";
import { BoardReferenceAtom, dialogAtom, IconEnum } from "../../../utils";
import { exportBoardFunction } from "../../../utils/ui/graphUtils";
import { Button, Select } from "../..";

export function ExportGraphDialog() {
  const boardRef = useAtomValue(BoardReferenceAtom);
  const dialog = useAtomValue(dialogAtom);
  const [exportSettings, setExportSettings] = useState<BoardExportType>({
    view: "current_view",
    background: "color",
    type: "PNG",
  });
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex w-full flex-col items-center">
        <Select
          label="View"
          name="view"
          onChange={({ name, value }) => setExportSettings((prev) => ({ ...prev, [name]: value }))}
          options={[
            { label: "Current view", value: "current_view" },
            { label: "Entire graph", value: "entire_graph" },
          ]}
          value={exportSettings.view}
        />
      </div>
      <div className="flex w-full flex-col items-center">
        <Select
          label="Background"
          name="background"
          onChange={({ name, value }) => setExportSettings((prev) => ({ ...prev, [name]: value }))}
          options={[
            { label: "Color", value: "color" },
            { label: "transparent", value: "transparent" },
          ]}
          value={exportSettings.background}
        />
      </div>
      <div className="flex w-full flex-col items-center">
        <Select
          label="type"
          name="type"
          onChange={({ name, value }) => setExportSettings((prev) => ({ ...prev, [name]: value }))}
          options={[
            { label: "PNG", value: "PNG" },
            { label: "JPEG", value: "JPEG" },
          ]}
          value={exportSettings.type}
        />
      </div>
      <div className="mt-2 flex w-full justify-center">
        <Button
          icon={IconEnum.download}
          iconPos="right"
          label="Export"
          onClick={() => {
            if (boardRef) {
              exportBoardFunction(
                boardRef,
                exportSettings.view,
                exportSettings.background,
                exportSettings.type,
                dialog.data?.title,
              );
            } else {
              // toaster("error", "There was an error exporting your board.");
            }
          }}
        />
      </div>
    </div>
  );
}
