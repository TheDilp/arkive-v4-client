import { useSetAtom } from "jotai";

import { DialogAtomType, ImageSelectType } from "../../types";
import { dialogAtom, IconEnum } from "../../utils";
import { Button, Select } from "../Form";

export function ImageSelect({ name, onChange, options, label, value, isLoading, type }: ImageSelectType) {
  const setDialogAtom = useSetAtom(dialogAtom);
  return (
    <div className="flex w-full flex-col">
      <div className="truncate pl-1 text-sm font-medium text-white">{label || "Select image"}</div>
      <div className="grid grid-cols-6 gap-x-2">
        <div className="col-span-4">
          <Select isLoading={isLoading} name={name} onChange={onChange} options={options} value={value} />
        </div>

        <div className="col-span-2">
          <Button
            icon={IconEnum.upload}
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
