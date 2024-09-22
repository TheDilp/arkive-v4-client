import { useSetAtom } from "jotai";

import { useHasPermissions } from "../../hooks";
import { DialogAtomType, ImageSelectType } from "../../types";
import { dialogAtom, IconEnum } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Button, Search } from "../Form";

export function ImageSelect({
  name,
  onChange,
  label,
  value,
  type,
  isIconOnly,
  helperText,
  isDisabled,
  isIgnoringPermissions,
  manual_project_id,
  variant,
}: ImageSelectType) {
  const setDialogAtom = useSetAtom(dialogAtom);

  const permissions = useHasPermissions(["read_assets", "create_assets"], undefined);

  return (
    <div className="flex w-full flex-col">
      <div className="grid grid-cols-6 gap-x-2">
        <div className={isIconOnly ? "col-span-5" : "col-span-4"}>
          {value ? (
            <EntityPreview
              clearAction={
                isDisabled
                  ? undefined
                  : () => {
                      onChange({ name, value: null });
                    }
              }
              id={value as string}
              image_id={value as string}
              manual_project_id={manual_project_id}
              title={label || ""}
              type={type === "map_images" ? "maps" : "images"}
            />
          ) : (
            <Search
              hasBrowser
              helperText={helperText}
              imageType={type}
              isDisabled={isDisabled || (!permissions?.read_assets && !isIgnoringPermissions)}
              label={label}
              limit={25}
              manual_project_id={manual_project_id}
              name={name}
              onChange={onChange}
              placeholder="Search images"
              searchEntity={type === "map_images" ? "map_images" : "images"}
              value={value}
              variant={variant || "primary"}
            />
          )}
        </div>

        <div className={`self-end ${isIconOnly ? "col-span-1" : "col-span-2"}`}>
          <Button
            icon={IconEnum.upload}
            isDisabled={isDisabled || (!permissions?.create_assets && !isIgnoringPermissions)}
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
