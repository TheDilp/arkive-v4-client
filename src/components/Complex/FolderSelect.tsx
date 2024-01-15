import React from "react";

import { useGetEntity } from "../../hooks";
import { EntitiesWithFolders, HandleChangePropsType } from "../../types";
import { IconEnum } from "../../utils";
import { EntityPreview } from "../DataDisplay";
import { Search } from "../Form";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

type Props = {
  type: EntitiesWithFolders;
  parent_id: string | null;
  handleChange: (props: HandleChangePropsType) => void;
};

type EntityWithParent = { id: string; title: string; parent_id: string; is_folder: boolean };

export function FolderSelect({ handleChange, type, parent_id }: Props) {
  const { data: parentData } = useGetEntity<EntityWithParent & { parents: EntityWithParent[] }>(
    parent_id as string,
    type,
    {
      data: {},
      relations: { parents: true },
      fields: ["id", "title", "parent_id"],
    },
    {
      enabled: !!parent_id,
      queryKeyConcat: [parent_id as string],
    },
  );
  return (
    <div className="flex flex-nowrap items-center gap-x-2">
      {!!parentData?.data?.parents?.length && parent_id ? (
        <div className="flex-1">
          <EntityPreview
            clearAction={() => handleChange({ name: "parent_id", value: null })}
            icon={IconEnum.folder}
            id="parent"
            label="Folder"
            title={parentData?.data?.parents?.at(-1)?.title || ""}
            type={type}
          />
        </div>
      ) : (
        <Search isFolders label="Folder" name="parent_id" onChange={handleChange} searchEntity={type} />
      )}

      <Tooltip
        allowedPlacements={["left"]}
        content={`root/${parentData?.data?.parents?.map((p) => p.title).join("/") || ""}`}
        isInline>
        <div className="mb-1.5 h-6 w-6 self-end">
          <Icon fontSize={24} icon={IconEnum.info_circle} />
        </div>
      </Tooltip>
    </div>
  );
}
