import { useSetAtom } from "jotai";
import omit from "lodash.omit";
import set from "lodash.set";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetSubEntity, useHandleChange, useUpdateGraphSubEntity } from "../../../hooks";
import { NodeType } from "../../../types";
import { getCharacterFullName, IconEnum, nodesAtom, removeFalsy, useNotifications } from "../../../utils";
import {
  DefaultBoardColor,
  GraphFontFamiliesEnum,
  GraphFontSizesEnum,
  NodeShapesEnum,
  TextHAlignEnum,
  TextVAlignEnum,
} from "../../../utils/enums/GraphEnums";
import { getNodeImage } from "../../../utils/ui/graphUtils";
import { Badge, Button, CharacterPreview, ImagePreview, ImageSelect, Input, Search, Select, Tabs, Title } from "../..";
import { ColorPicker } from "../ColorPicker";
import { updateNodeSchema } from "../../../validation";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Realations", icon: IconEnum.link },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];

type UpdateNodeType = { data: Partial<NodeType> };

export function NodeDrawer({ data }: { data: { id?: string; parent_id: string } }) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const createNotification = useNotifications();
  const { data: existingNode } = useGetSubEntity<NodeType>(
    data?.id,
    "nodes",
    {
      data: {},
      relations: { image: true, character: true, document: true, map_pin: true, event: true, tags: true },
    },
    {
      enabled: !!data?.id,
    },
  );
  const setNodes = useSetAtom(nodesAtom);

  const { mutateAsync: update } = useUpdateGraphSubEntity<
    UpdateNodeType & {
      relations?: {
        tags?: { id: string }[];
      };
    }
  >("nodes", data.parent_id);

  const [node, setNode] = useState<Partial<NodeType> & { parent_id: string }>(existingNode?.data || data);

  const { handleChange } = useHandleChange({ data: node, setData: setNode });

  useEffect(() => {
    if (existingNode?.data) {
      setNode(existingNode?.data);
    }
  }, [existingNode?.data]);

  return (
    <div className="flex flex-col gap-y-2 font-lato">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Title isDrawerTitle label="Shape" size="xl" />
          <div className="flex-1">
            <span className="text-sm text-zinc-300">Node image (optional)</span>
            {!node?.image ? (
              <ImageSelect
                isIconOnly
                name="image"
                onChange={({ name, label, value }) => handleChange({ name, value: { id: value, title: label } })}
                type="images"
                value={node?.image?.id ?? ""}
              />
            ) : (
              <ImagePreview
                clearAction={() => handleChange({ name: "image", value: null })}
                id={node?.image?.id}
                title={node?.image?.title}
              />
            )}
            <span className="text-xs text-zinc-400">Setting an image manually overwrites images from relations.</span>
          </div>
          <div className="flex w-full items-end justify-between">
            <div className="flex w-full items-end gap-x-2">
              <Select
                hasSearch
                label="Node shape"
                name="type"
                onChange={handleChange}
                options={NodeShapesEnum}
                value={node?.type || "rectangle"}
              />
              <div className="self-end pb-2">
                <ColorPicker
                  hasCustom
                  name="background_color"
                  onChange={handleChange}
                  value={node?.background_color || DefaultBoardColor}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="w-full">
              <Input label="Width" name="width" onChange={handleChange} type="number" value={node?.width || 50} />
            </div>
            <div className="w-full">
              <Input label="Height" name="height" onChange={handleChange} type="number" value={node?.height || 50} />
            </div>
          </div>

          <div className="flex-1">
            <Input
              label="Node opacity"
              name="background_opacity"
              onChange={handleChange}
              type="number"
              value={node?.background_opacity || 1}
            />
          </div>
          <div className="flex-1">
            <Input label="Node level" name="z_index" onChange={handleChange} type="number" value={node?.z_index || 1} />
          </div>
          <Title isDrawerTitle label="Label" size="xl" />
          <div className="flex w-full items-center gap-x-2">
            <Input
              label="Label (optional)"
              name="label"
              onChange={handleChange}
              placeholder="Eg. Node label"
              value={node?.label || ""}
            />
            <div className="self-end pb-2">
              <ColorPicker hasCustom name="font_color" onChange={handleChange} value={node?.font_color || "#ffffff"} />
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
              <div className="w-full">
                <Select
                  hasSearch
                  label="Label font family"
                  name="font_family"
                  onChange={handleChange}
                  options={GraphFontFamiliesEnum}
                  value={node?.font_family || "Lato"}
                />
              </div>
              <div className="w-full">
                <Select
                  label="Label font size"
                  name="font_size"
                  onChange={handleChange}
                  options={GraphFontSizesEnum}
                  value={node?.font_size || "16"}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="w-full">
              <Select
                label="Vertical alignment"
                name="text_v_align"
                onChange={handleChange}
                options={TextVAlignEnum}
                value={node?.text_v_align || "top"}
              />
            </div>
            <div className="w-full">
              <Select
                label="Horizontal alignment"
                name="text_h_align"
                onChange={handleChange}
                options={TextHAlignEnum}
                value={node?.text_h_align || "center"}
              />
            </div>
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-zinc-300">Represents character (optional)</span>
            {!node?.character ? (
              <Search
                isAutocomplete
                name="character.id"
                onChange={({ value, label, image }) => {
                  const [first_name, last_name] = (label || "").split(" ");
                  handleChange({ name: "character", value: { id: value, first_name, last_name, portrait_id: image } });
                }}
                placeholder="Press enter to search characters"
                searchEntity="characters"
                value={node?.character?.id || ""}
              />
            ) : null}
            {node?.character ? (
              <CharacterPreview
                character_name={getCharacterFullName(node?.character?.first_name, "", node?.character?.last_name)}
                clearAction={() => {
                  handleChange({ name: "character", value: "" });
                }}
                id={node?.character?.id}
                image_id={node?.character?.portrait_id}
              />
            ) : null}
          </div>
          <Search
            isDisabled
            label="Document (optional)"
            placeholder="Press enter to search documents"
            searchEntity="documents"
          />
          <Search isDisabled label="Location (optional)" placeholder="Press enter to search map pins" searchEntity="map_pins" />
          <Search isDisabled label="Event (optional)" placeholder="Press enter to search events" searchEntity="events" />
        </div>
      ) : null}
      {selectedTab === 2 ? (
        <div className="flex flex-col gap-y-2">
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              if ((node?.tags || [])?.some((tag) => tag.id === value)) {
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
                value: (node?.tags || []).concat({
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

          <div className="flex flex-wrap gap-2">
            {node?.tags?.length
              ? node.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (node?.tags || []).filter((t) => t.id !== tag.id) });
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
      ) : null}
      <Button
        icon={IconEnum.save}
        label="Save"
        onClick={async () => {
          if (node && node?.id) {
            const nodeToUpdate = { ...node };
            set(nodeToUpdate, "character_id", node?.character?.id ?? null);
            set(nodeToUpdate, "image_id", node?.image?.id ?? null);

            const { tags, ...rest } = nodeToUpdate;
            const parsedData = updateNodeSchema.parse({ data: rest, relations: { tags } });
            await update(parsedData);
            setNodes((oldNodes) => {
              if (oldNodes) {
                const newNodes = [...oldNodes];
                const idx = newNodes.findIndex((n) => n.data.id === node.id);
                if (idx > -1) {
                  const newNodeData = removeFalsy({
                    ...newNodes[idx].data,
                    ...node,
                  });
                  newNodes[idx] = {
                    ...newNodes[idx],
                    data: {
                      ...newNodeData,
                      background_image: getNodeImage(rest as NodeType, project_id as string),
                    },
                  };
                  return newNodes;
                }
                return newNodes;
              }
              return oldNodes;
            });
          }
        }}
        variant="success"
      />
    </div>
  );
}
