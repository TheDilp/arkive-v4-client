import { useState } from "react";

import { IconEnum } from "../../../utils";
import { GraphFontSizesEnum, NodeShapesEnum, TextHAlignEnum, TextVAlignEnum } from "../../../utils/enums/GraphEnums";
import { Input, Search, Select, Tabs, Title } from "../..";
import { ColorPicker } from "../ColorPicker";

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Realations", icon: IconEnum.link },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];

export function NodeDrawer({ data }: { data: { id?: string } }) {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className="flex flex-col gap-y-2 font-lato">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Title isDrawerTitle label="Shape" size="xl" />

          <div className="flex w-full items-end justify-between">
            <div className="flex w-full items-end gap-x-2">
              <Select
                label="Node shape"
                //   name={`[${index}].title`}
                //   onChange={handleChange}
                //   value={tag.title}
                options={NodeShapesEnum}
              />
              <div className="self-end pb-2">
                <ColorPicker hasCustom />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <div className="flex-1">
              <Input label="Width" type="number" />
            </div>
            <div className="flex-1">
              <Input label="Height" type="number" />
            </div>
          </div>
          <div className="flex-1">
            <Input label="Image (optional)" />
          </div>
          <div className="flex-1">
            <Input label="Node opacity" type="number" />
          </div>
          <div className="flex-1">
            <Input label="Node level" type="number" />
          </div>
          <Title isDrawerTitle label="Label" size="xl" />
          <div className="flex items-center gap-x-2">
            <div className="flex w-full items-end gap-x-2">
              <div className="flex-1">
                <Input label="Label (optional)" />
              </div>
              <div className="flex flex-1 items-center gap-x-2">
                <Select
                  label="Label font size"
                  //   name={`[${index}].title`}
                  //   onChange={handleChange}
                  //   value={tag.title}
                  options={GraphFontSizesEnum}
                />
                <div className="self-end pb-2">
                  <ColorPicker hasCustom />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <div className="flex-1">
              <Select label="Vertical alignment" options={TextVAlignEnum} />
            </div>
            <div className="flex-1">
              <Select label="Horizontal alignment" options={TextHAlignEnum} />
            </div>
          </div>
        </>
      ) : null}
      {selectedTab === 2 ? (
        <div className="flex flex-col gap-y-2">
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              // if ((character?.tags || [])?.some((tag) => tag.id === value)) {
              //   createNotification({
              //     id: crypto.randomUUID(),
              //     title: "Cannot add the same tag twice.",
              //     variant: "warning",
              //     icon: IconEnum.info_circle,
              //     timer: 3,
              //   });
              //   return;
              // }
              // handleChange({
              //   name,
              //   value: (character?.tags || []).concat({
              //     title: label as string,
              //     id: value,
              //     project_id: project_id as string,
              //     color: color as string,
              //   }),
              // });
            }}
            placeholder="Press enter to search tags"
            searchEntity="tags"
          />

          <div className="flex flex-wrap gap-2">
            {/* {character?.tags?.length
              ? character.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (character?.tags || []).filter((t) => t.id !== tag.id) });
                      }}
                      customColor={tag.color}
                      label={tag.title}
                      size="lg"
                    />
                  </div>
                ))
              : null} */}
          </div>
        </div>
      ) : null}
    </div>
  );
}
