import { useSetAtom } from "jotai";

import { DialogAtomType, ImageSelectType } from "../../types";
import { dialogAtom, IconEnum } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Button, Search } from "../Form";

export function ImageSelect({ name, onChange, label, value, type, isIconOnly, helperText, isDisabled }: ImageSelectType) {
  const setDialogAtom = useSetAtom(dialogAtom);

  return (
    <div className="flex w-full flex-col">
      <div className="truncate text-sm text-zinc-300">{label}</div>
      <div className="grid grid-cols-6 gap-x-2">
        <div className="col-span-4">
          {value ? (
            <EntityPreview
              clearAction={
                isDisabled
                  ? undefined
                  : () => {
                      onChange({ name, value: "" });
                    }
              }
              id={value as string}
              image_id={value as string}
              title={label || ""}
              type={type === "map_images" ? "maps" : "images"}
            />
          ) : (
            <Search
              helperText={helperText}
              imageType={type}
              isAutocomplete
              isDisabled={isDisabled}
              limit={100}
              name={name}
              onChange={onChange}
              placeholder="Search images"
              searchEntity={type === "map_images" ? "map_images" : "images"}
              value={value}
            />
          )}
        </div>

        <div className="col-span-2">
          <Button
            icon={IconEnum.upload}
            isDisabled={isDisabled}
            isIconOnly={isIconOnly}
            label="Upload new"
            onClick={() =>
              setDialogAtom((prev: DialogAtomType) => ({
                ...prev,
                type: "image_upload",
                title: "Upload images",
                size: "lg",
                isOverlay: true,
                data: {
                  type,
                },
              }))
            }
            variant="info"
          />
        </div>
      </div>
    </div>
  );
}
