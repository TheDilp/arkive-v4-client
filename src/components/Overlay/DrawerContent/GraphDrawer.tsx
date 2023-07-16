import { AvailableNodeShapes, IconEnum } from "../../../utils";
import { Button, Checkbox, Input, Search, Select } from "../..";
import { ColorPicker } from "../ColorPicker";

export function GraphDrawer() {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="w-full">
        <Input label="Graph title (required)" placeholder="Eg. Family tree" />
      </div>

      <div className="w-full">
        <Select options={AvailableNodeShapes} label="Default node shape" />
      </div>
      <div className="w-full">
        <Search label="Tags" placeholder="Press enter to search for tags" />
      </div>
      <div className="mt-2 flex w-full flex-col justify-between gap-y-2">
        <div className="flex w-full items-center justify-between">
          <span>Default node color:</span>
          <ColorPicker />
        </div>
        <div className="flex w-full items-center justify-between">
          <span>Default edge color:</span>
          <ColorPicker />
        </div>
        <div className="flex w-full items-center justify-between">
          <span>Is folder:</span>
          <Checkbox />
        </div>
        <div className="flex w-full items-center justify-between">
          <span>Is public:</span>
          <Checkbox />
        </div>
      </div>
      <Button
        icon={IconEnum.save}
        // isDisabled={isSaveDisabled(character)}
        // isLoading={isCreating || isUpdating}
        label={"Create"}
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
