import { useState } from "react";
import { useParams } from "react-router-dom";

import { useHandleChange } from "../../../hooks";
import { GraphType } from "../../../types";
import { AvailableNodeShapes, DefaultBoardColor, IconEnum, useNotifications } from "../../../utils";
import { Badge, Button, Checkbox, Input, Search, Select } from "../..";
import { ColorPicker } from "../ColorPicker";

export function GraphDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const [graph, setGraph] = useState<Partial<GraphType> & { project_id: string }>({ project_id: project_id as string });
  const { handleChange } = useHandleChange({ data: graph, setData: setGraph });
  const createNotification = useNotifications();
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
          options={AvailableNodeShapes}
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
        <div className="mt-2 flex flex-wrap gap-2">
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
        icon={IconEnum.save}
        // isDisabled={isSaveDisabled(character)}
        // isLoading={isCreating || isUpdating}
        label="Create"
        // onClick={async () => {
        //   if (character) {
        //     if (character?.id) {
        //       await update(
        //         {
        //           data: omit(character, ["character_fields", "related_to", "related_from", "tags"]),
        //           relations: {
        //             character_fields: character?.character_fields,
        //             related_to: character?.related_to,
        //             related_from: character?.related_from,
        //             tags: character?.tags,
        //           },
        //         },
        //         {
        //           onSettled: (res) => {
        //             if (res?.ok) resetDrawerAtom();
        //           },
        //         },
        //       );
        //     } else
        //       await create(
        //         {
        //           data: omit(character, ["character_fields", "related_to", "related_from", "tags"]),
        //           relations: {
        //             character_fields: character?.character_fields,
        //             related_to: character?.related_to,
        //             tags: character?.tags,
        //           },
        //         },
        //         {
        //           onSettled: (res) => {
        //             if (res?.ok) resetDrawerAtom();
        //           },
        //         },
        //       );
        //   }
        // }}
        variant="success"
      />
    </div>
  );
}
