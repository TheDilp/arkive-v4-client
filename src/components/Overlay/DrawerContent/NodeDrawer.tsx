import { GraphFontSizesEnum, NodeShapesEnum, TextHAlignEnum, TextVAlignEnum } from "../../../utils/enums/GraphEnums";
import { Input, Select, Title } from "../..";
import { ColorPicker } from "../ColorPicker";

export function NodeDrawer({ data }: { data: { id?: string } }) {
  return (
    <div className="flex flex-col gap-y-2 font-lato">
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
    </div>
  );
}
