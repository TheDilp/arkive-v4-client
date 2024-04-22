import { SetStateAction, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import set from "lodash.set";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange, useUpdateManySubEntities } from "../../../hooks";
import { NodeType } from "../../../types";
import { dialogAtom, drawerAtom, getCharacterFullName, IconEnum, nodesAtom, useNotifications } from "../../../utils";
import {
  DefaultBoardColor,
  DefaultNode,
  GraphFontFamiliesEnum,
  GraphFontSizesEnum,
  NodeShapesEnum,
  TextHAlignEnum,
  TextVAlignEnum,
} from "../../../utils/enums/GraphEnums";
import { getNodeImage, getNodeLabel } from "../../../utils/ui/graphUtils";
import { UpdateNodeSchema } from "../../../validation";
import { Alert, Button, EntityPreview, ImagePreview, ImageSelect, Input, Search, Select, Tabs, TagInput, Title } from "../..";
import { ColorPicker } from "../ColorPicker";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Realations", icon: IconEnum.link },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];

function UpdateGraphNodes({
  setNodes,
  changedData,
  project_id,
  rest,
  ids,
}: {
  setNodes: (arg: SetStateAction<NodeType[]>) => void;
  changedData: Partial<NodeType>;
  project_id: string;
  rest: Partial<NodeType>;
  ids: string[];
}) {
  setNodes((oldNodes) => {
    if (oldNodes) {
      const newNodes = [...oldNodes];

      for (let index = 0; index < ids.length; index += 1) {
        const idx = newNodes.findIndex((n) => n.id === ids[index]);
        if (idx > -1) {
          const alteredNodeData = { ...newNodes[idx], ...rest, ...changedData, id: newNodes[idx].id };

          set(newNodes, `[${idx}]`, {
            ...alteredNodeData,
            label: getNodeLabel(alteredNodeData as NodeType),
            background_image: getNodeImage(alteredNodeData as NodeType, project_id as string, {
              width: alteredNodeData.width || 50,
              height: alteredNodeData.height || 50,
            }),
          });
        }
      }
      return newNodes;
    }
    return oldNodes;
  });
}
function RestoreGraphNodes({
  setNodes,
  nodes,
  project_id,
}: {
  setNodes: (arg: SetStateAction<NodeType[]>) => void;
  nodes: NodeType[];
  project_id: string;
}) {
  setNodes((oldNodes) => {
    if (oldNodes) {
      const newNodes = [...oldNodes];

      for (let index = 0; index < nodes.length; index += 1) {
        const idx = newNodes.findIndex((n) => n.id === nodes[index].id);
        if (idx > -1) {
          const alteredNodeData = { ...newNodes[idx], ...nodes[index] };
          set(alteredNodeData, "character", nodes[index]?.character ?? null);
          set(alteredNodeData, "document", nodes[index]?.document ?? null);
          set(alteredNodeData, "map_pin", nodes[index]?.map_pin?.id ?? null);
          set(alteredNodeData, "event", nodes[index]?.event?.id ?? null);
          set(alteredNodeData, "image", nodes[index]?.image?.id ?? null);
          set(newNodes, `[${idx}]`, {
            ...alteredNodeData,
            label: getNodeLabel(alteredNodeData as NodeType),
            background_image: nodes[index].image
              ? getNodeImage(alteredNodeData as NodeType, project_id as string, {
                  width: nodes[index].width || 50,
                  height: nodes[index].height || 50,
                })
              : [],
          });
        }
      }
      return newNodes;
    }
    return oldNodes;
  });
}

export function ManyNodesDrawer({ data }: { data: { ids: string[]; parent_id: string } }) {
  const { project_id, item_id } = useParams();

  const { data: existingNodes } = useGetEntities<NodeType>(
    {
      data: {
        parent_id: item_id,
      },
      fields: [
        "id",
        "label",
        "icon",
        "background_color",
        "background_opacity",
        "font_color",
        "font_family",
        "font_size",
        "type",
        "image_id",
        "text_h_align",
        "text_v_align",
        "x",
        "y",
        "z_index",
        "width",
        "height",
        "is_locked",
      ],
      filters: {
        and: [
          {
            id: "parent",
            header_name: "Parent",
            field: "id",
            operator: "in",
            value: data.ids,
          },
        ],
      },
    },
    "nodes",
    { enabled: !!data.ids.length },
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const createNotification = useNotifications();

  const setNodes = useSetAtom(nodesAtom);
  const setDialogAtom = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const resetDrawerAtom = useResetAtom(drawerAtom);

  const originalNodes = existingNodes?.data;
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateManySubEntities("nodes");
  const [node, setNode] = useState<Partial<NodeType> & { parent_id: string }>({ ...DefaultNode, parent_id: data.parent_id });
  const { changedData, handleChange, resetChanges } = useHandleChange({ data: node, setData: setNode });
  useEffect(() => {
    if (changedData) {
      const nodeToUpdate = { ...(changedData || {}), id: node.id };
      set(nodeToUpdate, "character_id", node?.character?.id ?? null);
      set(nodeToUpdate, "doc_id", node?.document?.id ?? null);
      set(nodeToUpdate, "map_pin_id", node?.map_pin?.id ?? null);
      set(nodeToUpdate, "event_id", node?.event?.id ?? null);
      set(nodeToUpdate, "image_id", node?.image?.id ?? null);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tags, ...rest } = nodeToUpdate;
      UpdateGraphNodes({ project_id: project_id as string, rest, changedData, setNodes, ids: data.ids });
    }
  }, [changedData]);

  async function handleSave() {
    if (changedData) {
      const nodeToUpdate = { ...(changedData || {}), id: node.id };
      set(nodeToUpdate, "character_id", node?.character?.id ?? null);
      set(nodeToUpdate, "doc_id", node?.document?.id ?? null);
      set(nodeToUpdate, "map_pin_id", node?.map_pin?.id ?? null);
      set(nodeToUpdate, "event_id", node?.event?.id ?? null);
      set(nodeToUpdate, "image_id", node?.image?.id ?? null);
      set(nodeToUpdate, "tags", node?.tags ?? null);
      const { tags, ...rest } = nodeToUpdate;
      const parsedData = UpdateNodeSchema.array().parse(data.ids.map((id) => ({ data: { ...rest, id }, relations: { tags } })));

      await update(
        { data: parsedData.map((i) => ({ ...i, data: { ...i.data, parent_id: data.parent_id } })) },
        {
          onSuccess: () => {
            resetDrawerAtom();
            resetChanges();
          },
        },
      );
    } else {
      resetDrawerAtom();
      createNotification({
        variant: "info",
        icon: IconEnum.info_circle,
        title: "No data was changed.",
        timer: 3,
      });
    }
  }

  return (
    <div className="flex flex-col gap-y-2 overflow-auto font-lato">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />

      {selectedTab === 0 ? (
        <>
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
                  onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                  options={GraphFontSizesEnum}
                  value={node?.font_size?.toFixed() || "16"}
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
              <Input
                label="Width"
                max={5000}
                min={10}
                name="width"
                onChange={handleChange}
                step={5}
                type="number"
                value={node?.width || 50}
              />
            </div>
            <div className="w-full">
              <Input
                label="Height"
                max={5000}
                min={10}
                name="height"
                onChange={handleChange}
                step={5}
                type="number"
                value={node?.height || 50}
              />
            </div>
          </div>

          <div className="flex-1">
            <Input
              label="Node opacity"
              max={1}
              min={0}
              name="background_opacity"
              onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
              step={0.01}
              type="number"
              value={node?.background_opacity ?? 1}
            />
          </div>
          <div className="flex-1">
            <Input label="Node level" name="z_index" onChange={handleChange} type="number" value={node?.z_index || 1} />
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="flex flex-col gap-y-2">
          {!node?.character ? (
            <Search
              label="Represents character (optional)"
              name="character.id"
              onChange={({ value, label, image }) => {
                const [first_name, last_name] = (label || "").split(" ");
                handleChange({ name: "character", value: { id: value, first_name, last_name, portrait_id: image } });
              }}
              placeholder="Press enter to search characters"
              searchEntity="characters"
              value={node?.character?.id || ""}
            />
          ) : (
            <EntityPreview
              clearAction={() => {
                handleChange({ name: "character", value: "" });
              }}
              id={node?.character?.id}
              image_id={node?.character?.portrait_id ?? undefined}
              label="Represents character (optional)"
              link={`/projects/${project_id}/characters/${node.character_id}`}
              title={getCharacterFullName(node?.character?.first_name, "", node?.character?.last_name || "")}
              type="characters"
            />
          )}
          {!node?.document ? (
            <Search
              label="Related document (optional)"
              name="document.id"
              onChange={({ value, label }) => {
                handleChange({ name: "document", value: { id: value, title: label } });
              }}
              placeholder="Press enter to search documents"
              searchEntity="documents"
              value={node?.document?.id || ""}
            />
          ) : (
            <EntityPreview
              clearAction={() => {
                handleChange({ name: "document", value: "" });
              }}
              icon={IconEnum.document}
              id={node?.document?.id}
              link={`/projects/${project_id}/documents/${node.document.id}`}
              title={node?.document?.title}
              type="documents"
            />
          )}
          {!node?.map_pin ? (
            <Search
              label="Related location (optional)"
              name="map_pin.id"
              onChange={({ value, label }) => {
                handleChange({ name: "map_pin", value: { id: value, title: label } });
              }}
              placeholder="Press enter to search map pins"
              searchEntity="map_pins"
              value={node?.document?.id || ""}
            />
          ) : (
            <EntityPreview
              clearAction={() => {
                handleChange({ name: "map_pin", value: "" });
              }}
              icon={IconEnum.map_pin}
              id={node?.map_pin?.id}
              label="Related location (optional)"
              link={`/projects/${project_id}/maps/${node.map_pin.parent_id}/${node.map_pin.id}`}
              title={node?.map_pin?.title || "Map pin has no title"}
              type="map_pins"
            />
          )}
          {!node?.event ? (
            <Search
              label="Related event (optional)"
              name="event.id"
              onChange={({ value, label }) => {
                handleChange({ name: "event", value: { id: value, title: label } });
              }}
              placeholder="Press enter to search events"
              searchEntity="events"
              value={node?.event?.id || ""}
            />
          ) : (
            <EntityPreview
              clearAction={() => {
                handleChange({ name: "event", value: "" });
              }}
              icon={IconEnum.event}
              id={node?.event?.id}
              link={`/projects/${project_id}/calendars/${node.event.parent_id}/${node.event.id}`}
              title={node?.event?.title}
              type="events"
            />
          )}
        </div>
      ) : null}
      {selectedTab === 2 ? <TagInput handleChange={handleChange} tags={node.tags || []} /> : null}

      <div className="sticky bottom-0 flex flex-nowrap items-center gap-x-2">
        <Button
          icon={IconEnum.close}
          label="Cancel"
          onClick={() => {
            if (changedData)
              setDialogAtom({
                position: "center",
                isOverlay: true,
                data: null,
                title: "Are you sure you want to close the drawer? You will lose all unsaved changes.",
                type: null,
                size: "md",
                confirm: {
                  action: () => {
                    if (originalNodes) {
                      RestoreGraphNodes({
                        setNodes,
                        nodes: originalNodes,
                        project_id: project_id as string,
                      });
                    }
                    resetChanges();
                    resetDrawerAtom();
                    resetDialogAtom();
                  },
                },
                cancel: {
                  action: () => resetDialogAtom(),
                },
              });
            else {
              resetDrawerAtom();
            }
          }}
          variant="secondary"
        />
        <Button
          icon={IconEnum.save}
          isDisabled={isUpdating}
          isLoading={isUpdating}
          label="Save"
          onClick={handleSave}
          variant="success"
        />
      </div>
      {changedData ? (
        <div className="sticky top-0 z-10">
          <Alert label="You have unsaved changes." variant="warning-bordered" />
        </div>
      ) : null}
    </div>
  );
}
