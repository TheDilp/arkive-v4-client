import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import { EntityPermissionType, GraphType, TabType, UserHasPermissionsType } from "../../../types";
import { DefaultBoardColor, drawerAtom, IconEnum, NodeShapesEnum } from "../../../utils";
import { Button, Checkbox, DrawerLayout, FolderSelect, IconPicker, Input, Select, Skeleton, Tabs, TagInput } from "../..";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ColorPicker } from "../ColorPicker";

type insertGraphType = Partial<GraphType> & { parent_id?: string | null; project_id: string };
type updateGraphType = Partial<GraphType> & { parent_id?: string | null };

type graphRelationsType = {
  tags?: { id: string }[];
};

function isSaveDisabled(graph: Partial<GraphType>) {
  if (!graph.title) return true;
  return false;
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];
  if (permissions?.read_tags) {
    tabs.push({ id: "2", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function GraphDrawer({ data }: { data: { id?: string; title?: string } }) {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { data: existingGraph, isFetching } = useGetEntity<GraphType>(
    data?.id,
    "graphs",
    {
      data: { project_id },
      relations: {
        tags: true,
      },
      permissions: true,
      fields: [
        "id",
        "owner_id",
        "title",
        "icon",
        "parent_id",
        "default_node_shape",
        "default_node_color",
        "default_edge_color",
        "is_folder",
        "is_public",
      ],
    },
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] },
  );
  const permissions = useHasPermissions(
    ["read_graphs", "update_graphs", "delete_graphs", "read_tags"],

    existingGraph?.data?.owner_id,
  );
  const tabs = getTabs(permissions, existingGraph?.data?.id);

  const [graph, setGraph] = useState<Partial<GraphType> & { project_id: string }>(
    existingGraph?.data || {
      title: data?.title,
      project_id: project_id as string,
      parent_id: data?.title ? null : item_id,
      default_node_shape: "rectangle",
    },
  );
  const { handleChange } = useHandleChange({ data: graph, setData: setGraph });
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: insertGraphType;
    relations?: graphRelationsType;
    permissions: EntityPermissionType[];
  }>("graphs");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: updateGraphType;
    relations?: graphRelationsType;
    permissions: EntityPermissionType[];
  }>("graphs", project_id as string);

  useEffect(() => {
    if (existingGraph?.data) {
      setGraph(existingGraph?.data);
    }
  }, [existingGraph]);

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex w-full flex-nowrap gap-x-2">
            <Input
              label="Graph title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Eg. Family tree"
              value={graph?.title || ""}
            />
            <div className="self-end pb-1.5">
              <IconPicker icon={graph?.icon || IconEnum.graph} name="icon" onChange={handleChange} />
            </div>
          </div>

          <div className="w-full">
            <Select
              label="Default node shape"
              name="default_node_shape"
              onChange={handleChange}
              options={NodeShapesEnum}
              value={graph?.default_node_shape || ""}
            />
          </div>

          <div className="mt-2 flex w-full flex-col justify-between gap-y-2">
            <div className="flex w-full items-center justify-between">
              <span>Default node color:</span>
              <ColorPicker
                name="default_node_color"
                onChange={handleChange}
                value={graph?.default_node_color || DefaultBoardColor}
              />
            </div>
            <div className="flex w-full items-center justify-between">
              <span>Default edge color:</span>
              <ColorPicker
                name="default_edge_color"
                onChange={handleChange}
                value={graph?.default_edge_color || DefaultBoardColor}
              />
            </div>

            <FolderSelect handleChange={handleChange} parent_id={graph?.parent_id ?? null} type="graphs" />

            <div className="flex w-full items-center justify-between">
              <span>Is public:</span>
              <Checkbox name="is_public" onChange={handleChange} value={graph?.is_public ?? false} />
            </div>
          </div>
        </>
      ) : null}

      {tabs[selectedTab].id === "2" ? <TagInput handleChange={handleChange} isMultiple tags={graph?.tags || []} /> : null}

      {tabs[selectedTab].id === "3" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={graph?.owner_id}
          permissions={graph?.permissions || []}
          related_id={graph?.id || null}
          selectablePermissions={["read_graphs", "update_graphs", "delete_graphs"]}
        />
      ) : null}

      <div>
        <Button
          icon={graph?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(graph) || isCreating || isUpdating || !permissions?.update_graphs}
          isLoading={isCreating || isUpdating}
          label={graph?.id ? "Save" : "Create"}
          onClick={async () => {
            if (graph) {
              if (graph?.id) {
                await update(
                  {
                    data: omit(graph, ["tags", "permissions"]),
                    relations: {
                      tags: graph?.tags,
                    },
                    permissions: graph?.permissions || [],
                  },
                  {
                    onSettled: (res) => {
                      if (res?.ok) resetDrawerAtom();
                    },
                  },
                );
              } else
                await create(
                  {
                    data: omit(graph, ["tags", "permissions"]),
                    relations: {
                      tags: graph?.tags,
                    },
                    permissions: graph?.permissions || [],
                  },
                  {
                    onSettled: (res) => {
                      if (res?.ok) resetDrawerAtom();
                    },
                  },
                );
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
