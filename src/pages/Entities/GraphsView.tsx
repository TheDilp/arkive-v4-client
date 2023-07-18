/* eslint-disable react/prop-types */

import { useSetAtom } from "jotai";

import { FolderView } from "../../components";
import { drawerAtom, IconEnum } from "../../utils";

export function GraphsView() {
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <FolderView
          contextMenuItems={[
            {
              title: "Edit graph",
              icon: IconEnum.edit,
              onClick: (props) => {
                setDrawer((prev) => ({
                  ...prev,
                  position: "right",
                  type: "graphs",
                  title: `Edit graph - ${props?.contextTitle}`,
                  data: { id: props?.contextId },
                }));
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
