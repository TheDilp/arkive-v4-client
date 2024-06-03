import { SetStateAction, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import set from "lodash.set";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange, useToggledResetAtom, useUpdateManySubEntities } from "../../../hooks";
import { ArrowFill, ArrowShape, EdgeType, SelectType } from "../../../types";
import {
  capitalizeFirstLetter,
  DefaultBoardColor,
  dialogAtom,
  EdgeArrowFillEnum,
  EdgeArrowShapesEnum,
  EdgeCurveStylesEnum,
  EdgeLineStylesEnum,
  edgesAtom,
  EdgeTaxiDirectionsEnum,
  GraphFontFamiliesEnum,
  GraphFontSizesEnum,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { UpdateEdgeSchema } from "../../../validation";
import { Alert, Button, Collapsible, Input, Range, Select, Skeleton, Tabs, TagInput, Title } from "../..";
import { ColorPicker } from "../ColorPicker";

type Props = { data: { ids: string[]; parent_id: string } };

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Arrows", icon: IconEnum.flow_arrow },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];
const edgeArrows = ["target", "source", "mid_target", "mid_source"] as const;

function UpdateGraphEdges({
  setEdges,
  changedData,
  ids,
}: {
  setEdges: (arg: SetStateAction<EdgeType[]>) => void;
  changedData: Partial<EdgeType>;
  ids: string[];
}) {
  setEdges((oldEdges) => {
    if (oldEdges) {
      const newEdges = [...oldEdges];

      for (let index = 0; index < ids.length; index += 1) {
        const idx = newEdges.findIndex((n) => n.id === ids[index]);
        if (idx > -1) {
          const alteredEdgeData = { ...newEdges[idx], ...changedData, id: newEdges[idx].id };

          set(newEdges, `[${idx}]`, alteredEdgeData);
        }
      }
      return newEdges;
    }
    return oldEdges;
  });
}
function RestoreGraphEdges({ setEdges, edges }: { setEdges: (arg: SetStateAction<EdgeType[]>) => void; edges: EdgeType[] }) {
  setEdges((oldEdges) => {
    if (oldEdges) {
      const newEdges = [...oldEdges];

      for (let index = 0; index < edges.length; index += 1) {
        const idx = newEdges.findIndex((n) => n.id === edges[index].id);
        if (idx > -1) {
          const alteredEdgeData = { ...newEdges[idx], ...edges[index] };
          set(alteredEdgeData, "tags", edges[index]?.tags ?? null);
          set(newEdges, `[${idx}]`, alteredEdgeData);
        }
      }
      return newEdges;
    }
    return oldEdges;
  });
}

function ArrowForm({
  label,
  shape,
  color,
  fill,
  onChange,
}: {
  label: string;
  shape: ArrowShape;
  color: string;
  fill: ArrowFill;
} & Pick<SelectType, "onChange">) {
  return (
    <Collapsible initialOpen={false} label={capitalizeFirstLetter(label).replace("_", "-")}>
      <div className="mt-2 flex flex-nowrap items-center gap-2">
        <Select
          label="Arrow shape"
          name={`${label}_arrow_shape`}
          onChange={onChange}
          options={EdgeArrowShapesEnum}
          value={shape}
        />
        <Select label="Arrow fill" name={`${label}_arrow_fill`} onChange={onChange} options={EdgeArrowFillEnum} value={fill} />
        <div className="w-fit self-end">
          <ColorPicker name={`${label}_arrow_color`} onChange={onChange} value={color} />
        </div>
      </div>
    </Collapsible>
  );
}

export function ManyEdgesDrawer({ data }: Props) {
  const { item_id } = useParams();
  const [edge, setEdge] = useState<Partial<EdgeType>>({});
  const [selectedTab, setSelectedTab] = useState(0);

  const setEdges = useSetAtom(edgesAtom);
  const setDialogAtom = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const resetDrawerAtom = useToggledResetAtom();
  const { handleChange, changedData, resetChanges } = useHandleChange({ data: edge, setData: setEdge });
  const createNotification = useNotifications();

  const {
    data: existingEdges,
    isFetching,
    isInitialLoading,
  } = useGetEntities<EdgeType>(
    {
      data: { parent_id: item_id },
      fields: [
        "id",
        "label",
        "curve_style",
        "line_style",
        "line_color",
        "line_fill",
        "line_opacity",
        "width",
        "control_point_distances",
        "control_point_weights",
        "taxi_direction",
        "taxi_turn",
        "arrow_scale",
        "target_arrow_shape",
        "target_arrow_fill",
        "target_arrow_color",
        "source_arrow_shape",
        "source_arrow_fill",
        "source_arrow_color",
        "mid_target_arrow_shape",
        "mid_target_arrow_fill",
        "mid_target_arrow_color",
        "mid_source_arrow_shape",
        "mid_source_arrow_fill",
        "mid_source_arrow_color",
        "font_size",
        "font_color",
        "font_family",
        "z_index",
        "source_id",
        "target_id",
        "parent_id",
      ],
      filters: { and: [{ id: "id", header_name: "edges", field: "id", operator: "in", value: data.ids }] },
    },
    "edges",
    {
      enabled: !!data?.ids?.length,
    },
  );
  const originalEdges = existingEdges?.data;

  const { mutateAsync: update, isLoading: isMutating } = useUpdateManySubEntities("edges");

  useEffect(() => {
    if (changedData) {
      UpdateGraphEdges({ ids: data.ids, changedData, setEdges });
    }
  }, [changedData]);

  async function handleSave() {
    if (changedData) {
      const edgeToUpdate = { ...(changedData || {}), id: edge.id };
      const { tags, ...rest } = edgeToUpdate;
      const parsedData = UpdateEdgeSchema.array().parse(data.ids.map((id) => ({ data: { ...rest, id }, relations: { tags } })));

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
      createNotification({
        variant: "info",
        icon: IconEnum.info_circle,
        title: "No data was changed.",
        timer: 3,
      });
    }
  }

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2 font-lato">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Title isDrawerTitle label="Label" size="xl" />
          <div className="flex w-full items-center gap-2">
            <Input
              label="Label (optional)"
              name="label"
              onChange={handleChange}
              placeholder="Eg. Edge label"
              value={edge?.label || ""}
            />
            <div className="self-end pb-2">
              <ColorPicker hasCustom name="font_color" onChange={handleChange} value={edge?.font_color || "#ffffff"} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
              <div className="w-full">
                <Select
                  hasSearch
                  label="Label font family"
                  name="font_family"
                  onChange={handleChange}
                  options={GraphFontFamiliesEnum}
                  value={edge?.font_family || "Lato"}
                />
              </div>
              <div className="w-full">
                <Select
                  label="Label font size"
                  name="font_size"
                  onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                  options={GraphFontSizesEnum}
                  value={edge?.font_size?.toFixed() || "16"}
                />
              </div>
            </div>
          </div>
          <Title isDrawerTitle label="Edge style" size="xl" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
              <div className="w-full">
                <Select
                  label="Curve type"
                  name="curve_style"
                  onChange={handleChange}
                  options={EdgeCurveStylesEnum}
                  value={edge?.curve_style || "straight"}
                />
              </div>
              <div className="w-full">
                <Select
                  label="Line style"
                  name="line_style"
                  onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                  options={EdgeLineStylesEnum}
                  value={edge?.line_style || "solid"}
                />
              </div>
            </div>
            {edge?.curve_style === "taxi" ? (
              <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
                <div className="w-full">
                  <Select
                    hasSearch
                    label="Edge direction"
                    name="taxi_direction"
                    onChange={handleChange}
                    options={EdgeTaxiDirectionsEnum}
                    value={edge?.taxi_direction || "auto"}
                  />
                </div>
                <div className="w-full">
                  <Input
                    label="Break distance"
                    max={1000}
                    min={0}
                    name="taxi_turn"
                    onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                    step={5}
                    type="number"
                    value={(edge?.taxi_turn ?? 50)?.toFixed()}
                  />
                </div>
              </div>
            ) : null}
            {edge?.curve_style === "unbundled-bezier" ? (
              <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
                <div className="w-full">
                  <Range
                    label={`Curve strength: ${edge?.control_point_distances || 0}`}
                    max={1000}
                    min={-1000}
                    name="control_point_distances"
                    onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                    step={10}
                    value={(edge?.control_point_distances || -100)?.toString()}
                  />
                </div>
                <div className="w-full">
                  <Range
                    label={`Curve center: ${edge?.control_point_weights || 0.5}`}
                    max={1}
                    min={0}
                    name="control_point_weights"
                    onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
                    step={0.1}
                    value={edge?.control_point_weights?.toString() || "0.5"}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex w-full items-center gap-x-2">
            <Input
              label="Opacity"
              max={1}
              min={0}
              name="line_opacity"
              onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
              step={0.1}
              type="number"
              value={edge?.line_opacity?.toString() || "1"}
            />
            <Input
              label="Level"
              name="z_index"
              onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
              type="number"
              value={edge?.z_index?.toFixed() || "1"}
            />
          </div>
          <div className="flex w-full items-center gap-x-2">
            <Input
              label="Thickness"
              max={100}
              min={1}
              name="width"
              onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
              step={1}
              type="number"
              value={edge?.width?.toString() || "1"}
            />
            <div className="self-end pb-2">
              <ColorPicker hasCustom name="line_color" onChange={handleChange} value={edge?.line_color || "#595959"} />
            </div>
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="flex flex-col gap-y-2">
          {edgeArrows.map((a) => (
            <ArrowForm
              color={edge?.[`${a}_arrow_color`] || DefaultBoardColor}
              fill={edge?.[`${a}_arrow_fill`] || "filled"}
              label={a}
              onChange={handleChange}
              shape={edge?.[`${a}_arrow_shape`] || "none"}
            />
          ))}
        </div>
      ) : null}
      {selectedTab === 2 ? <TagInput handleChange={handleChange} tags={edge.tags || []} /> : null}
      <div className="flex flex-nowrap items-center gap-x-2">
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
                    if (originalEdges) {
                      RestoreGraphEdges({
                        setEdges,
                        edges: originalEdges,
                      });
                    }
                    resetChanges();
                    resetDrawerAtom(true);
                    resetDialogAtom();
                  },
                },
                cancel: {
                  action: () => resetDialogAtom(),
                },
              });
            else resetDrawerAtom(true);
          }}
          variant="secondary"
        />
        <Button
          icon={IconEnum.save}
          isDisabled={isFetching || isMutating}
          isLoading={isFetching || isMutating}
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
