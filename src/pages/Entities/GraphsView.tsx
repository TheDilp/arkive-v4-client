/* eslint-disable react/prop-types */
import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { Button, FolderView } from "../../components";
import { useGetAllEntities } from "../../hooks";
import { GraphType } from "../../types";
import { drawerAtom, IconEnum } from "../../utils";

export function GraphsView() {
  const { project_id, item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);

  const { data } = useGetAllEntities<GraphType>(
    {
      pagination: {
        limit: 10,
        page: 0,
      },
      data: {
        project_id,
        item_id,
      },
      fields: ["id", "title", "icon", "is_folder", "parent_id"],
      orderBy: {
        field: "is_folder",
        sort: "desc",
      },
    },
    "graphs",
    {
      enabled: !item_id,
    },
  );

  return (
    <div className="flex h-full flex-col">
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
          items={data?.data || []}
        />
      </div>
    </div>
  );
}
