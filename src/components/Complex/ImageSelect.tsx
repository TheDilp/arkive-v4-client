import { useSetAtom } from "jotai";

import { DialogAtomType, ImageSelectType } from "../../types";
import { dialogAtom, IconEnum } from "../../utils";
import { Button, Search } from "../Form";

export function ImageSelect({ name, onChange, label, value, type, isIconOnly, helperText }: ImageSelectType) {
  const setDialogAtom = useSetAtom(dialogAtom);

  return (
    <div className="flex w-full flex-col">
      <div className="truncate text-sm font-medium text-zinc-300">{label || "Select image"}</div>
      <div className="grid grid-cols-6 gap-x-2">
        <div className="col-span-4">
          <Search
            helperText={helperText}
            isAutocomplete
            name={name}
            onChange={onChange}
            placeholder="Search images"
            searchEntity="images"
            value={value}
          />
        </div>

        <div className="col-span-2">
          <Button
            icon={IconEnum.upload}
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
