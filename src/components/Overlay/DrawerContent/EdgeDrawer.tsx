import { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { EdgeType } from "../../../types";
import {
  EdgeCurveStylesEnum,
  EdgeLineStylesEnum,
  EdgeTaxiDirectionsEnum,
  GraphFontFamiliesEnum,
  GraphFontSizesEnum,
  IconEnum,
} from "../../../utils";
import { Input, Range, Select, Tabs, Title } from "../..";
import { ColorPicker } from "../ColorPicker";

type Props = { id: string; parent_id: string };

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Arrows", icon: IconEnum.flow_arrow },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];

export function EdgeDrawer({ id, parent_id }: Props) {
  const [edge, setEdge] = useState<Partial<EdgeType>>({});
  const [selectedTab, setSelectedTab] = useState(0);
  const { handleChange, changedData } = useHandleChange({ data: edge, setData: setEdge });
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
                    name="taxi_turn"
                    onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                    type="number"
                    value={edge?.taxi_turn?.toFixed()}
                  />
                </div>
              </div>
            ) : null}
            {edge?.curve_style === "unbundled_bezier" ? (
              <div className="flex w-full flex-col items-end gap-2 lg:flex-row">
                <div className="w-full">
                  <Range
                    label={`Curve strength: ${edge?.control_point_weights || 0}`}
                    max={1000}
                    min={-1000}
                    name="control_point_weights"
                    onChange={({ name, value }) => handleChange({ name, value: parseInt(value as string, 10) })}
                    step={10}
                    value={(edge?.control_point_weights || 0)?.toFixed()}
                  />
                </div>
                <div className="w-full">
                  <Range
                    label={`Curve center: ${edge?.control_point_distances}`}
                    max={1}
                    min={0}
                    name="control_point_distances"
                    onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
                    step={0.1}
                    value={edge?.control_point_distances?.toString() || "0.5"}
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
              name="width"
              onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
              type="number"
              value={edge?.width?.toFixed() || ""}
            />
            <div className="self-end pb-2">
              <ColorPicker hasCustom name="font_color" onChange={handleChange} value={edge?.font_color || "#ffffff"} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
