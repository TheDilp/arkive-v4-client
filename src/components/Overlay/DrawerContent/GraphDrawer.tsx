import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetItem, useHandleChange, useUpdateEntity } from "../../../hooks";
import { GraphType } from "../../../types";
import { DefaultBoardColor, drawerAtom, IconEnum, NodeShapesEnum, useNotifications } from "../../../utils";
import { Badge, Button, Checkbox, Input, Search, Select } from "../..";
import { ColorPicker } from "../ColorPicker";

type insertGraphType = Partial<GraphType> & { project_id: string };
type updateGraphType = Partial<GraphType>;

type graphRelationsType = {
  tags?: { id: string }[];
};

function isSaveDisabled(graph: Partial<GraphType>) {
  if (!graph.title) return true;
  return false;
}

export function GraphDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const createNotification = useNotifications();

  const { data: existingGraph } = useGetItem<GraphType>(
    data?.id,
    "graphs",
    {
      data: { project_id },

      relations: {
        tags: true,
      },
    },
    { enabled: !!data?.id },
  );

  const [graph, setGraph] = useState<Partial<GraphType> & { project_id: string }>(
    existingGraph?.data || { project_id: project_id as string },
  );
  const { handleChange } = useHandleChange({ data: graph, setData: setGraph });
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: insertGraphType;
    relations?: graphRelationsType;
  }>("graphs");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: updateGraphType;
    relations?: graphRelationsType;
  }>("graphs", project_id as string);

  useEffect(() => {
    if (existingGraph?.data) {
      setGraph(existingGraph?.data);
    }
  }, [existingGraph]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="w-full">
        <Input
          label="Graph title (required)"
          name="title"
          onChange={handleChange}
          placeholder="Eg. Family tree"
          value={graph?.title || ""}
        />
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
      <div className="w-full">
        <Search
          label="Tags"
          name="tags"
          onChange={({ name, color, value, label }) => {
            if ((graph?.tags || [])?.some((tag) => tag.id === value)) {
              createNotification({
                id: crypto.randomUUID(),
                title: "Cannot add the same tag twice.",
                variant: "warning",
                icon: IconEnum.info_circle,
                timer: 3,
              });
              return;
            }
            handleChange({
              name,
              value: (graph?.tags || []).concat({
                title: label as string,
                id: value,
                project_id: project_id as string,
                color: color as string,
              }),
            });
          }}
          placeholder="Press enter to search tags"
          searchEntity="tags"
        />
        <div className="mt-2 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
          {graph?.tags?.length
            ? graph.tags.map((tag) => (
                <div key={tag.id} className="w-fit">
                  <Badge
                    clearAction={() => {
                      handleChange({ name: "tags", value: (graph?.tags || []).filter((t) => t.id !== tag.id) });
                    }}
                    customColor={tag.color}
                    label={tag.title}
                    size="lg"
                  />
                </div>
              ))
            : null}
        </div>
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
        <div className="flex w-full items-center justify-between">
          <span>Is folder:</span>
          <Checkbox name="is_folder" onChange={handleChange} value={graph?.is_folder ?? false} />
        </div>
        <div className="flex w-full items-center justify-between">
          <span>Is public:</span>
          <Checkbox name="is_public" onChange={handleChange} value={graph?.is_public ?? false} />
        </div>
      </div>
      <Button
        icon={graph?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(graph)}
        isLoading={isCreating || isUpdating}
        label={graph?.id ? "Save" : "Create"}
        onClick={async () => {
          if (graph) {
            if (graph?.id) {
              await update(
                {
                  data: omit(graph, ["tags"]),
                  relations: {
                    tags: graph?.tags,
                  },
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
                  data: omit(graph, ["tags"]),
                  relations: {
                    tags: graph?.tags,
                  },
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
  );
}
