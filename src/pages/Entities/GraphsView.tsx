import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { Button } from "../../components";
import { drawerAtom, IconEnum } from "../../utils";

export function GraphsView() {
  const { project_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new graph"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new graph",
                type: "graphs",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
